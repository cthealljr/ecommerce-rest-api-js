// Copyright 2024 Charles Theall Jr
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { createHash, randomBytes } from 'node:crypto'

// pgPromise is only imported for type references
import pgPromise from 'pg-promise'

import { GenericContainer } from 'testcontainers'
import { pgp } from '../../../db/index.js'
import { createSchema } from '../../../db/setupDatabase.js'
import { loadSQLFile } from '../../../db/sql/index.js'
import { join } from 'node:path'

/**
 * Gets the Docker image name for PostgreSQL.
 *
 * Returns the value of the environment variable TEST_POSTGRES_IMAGE if set,
 * otherwise, returns "postgres:latest"
 *
 * @returns {string} Docker image name for PostgreSQL
 */
function getPostgresImage () {
  if (process.env.TEST_POSTGRES_IMAGE) {
    return process.env.TEST_POSTGRES_IMAGE
  }

  return 'postgres:latest'
}

const sampleDataSQL = loadSQLFile(join(import.meta.dirname, 'sampleData.sql'))

// The current implementation and use of PostgresContainer is to create a new container for each test suite (i.e., test file).
// While testcontainers can reuse the same container, doing so would require careful planning so that each
// test suite either uses separate databases (needed to support running tests in parallel) or uses the same database with no support
// for parallel testing.

/**
 * PostgresContainer represents a container for testing against an isolated instance of PostgreSQL.
 */
class PostgresContainer {
  constructor () {
    this.container = null
    this.password = null
    this.port = 5432
    this.db = null
  }

  /**
   * Generate a random password for PostgreSQL
   */
  _generatePassword () {
    if (this.password === null) {
      // Only generate password once

      // This uses a hash of random bytes as the password.
      // Is there a better or more secure way?
      // While this is simply a throwaway container, if there is a better or more secure way, it should be used.
      const hasher = createHash('sha256')
      const randomData = randomBytes(64)
      hasher.update(randomData)
      this.password = hasher.digest('hex')
    }
  }

  async _loadSampleData () {
    // First TRUNCATE all tables resetting identities
    await this.db.none('TRUNCATE users, products, orders, order_items, carts, cart_items RESTART IDENTITY CASCADE;')

    // Second load sample data
    await this.db.none(sampleDataSQL)
  }

  /**
   * Start container
   */
  async start () {
    this._generatePassword()

    if (this.container === null) {
      // Ensure container is started once
      const imageName = getPostgresImage()
      console.info(`Using PostgreSQL docker image: ${imageName}`)
      this.container = await new GenericContainer(imageName)
        .withEnvironment({ POSTGRES_PASSWORD: this.password })
        .withExposedPorts(this.port)
        .start()
    }
  }

  /**
   * Stop container
   */
  async stop () {
    if (this.container !== null) {
      await this.container.stop()
    }
  }

  /**
   * Returns a configuration object for connecting to PostgreSQL in the container.
   * @returns {config}
   * @throws an instance of Error when container has not been started.
   */
  getConfig () {
    if (this.container === null) {
      throw new Error('PostgreSQL container is not started')
    }

    return {
      host: this.container.getHost(),
      port: this.container.getMappedPort(this.port),
      user: 'postgres',
      password: this.password
    }
  }

  /**
   * Performs necessary setup before tests.
   *
   *   - Starts container
   *   - Creates database user `ecomapi` and database `ecomapi`
   *   - Creates database schema
   *
   * For use in Mocha `before` hook or similar test hook.
   *
   * @returns {Promise<pgPromise.IDatabase>} a Promise that resolves to a database handle for interacting with the created database.
   */
  async before () {
    // Start container
    await this.start()

    const containerConfig = this.getConfig()
    const dbHandleOne = pgp(containerConfig)
    await createDatabaseAndUser(dbHandleOne, 'ecomapi', 'ecomapi', this.password)
    await dbHandleOne.$pool.end()

    this.db = pgp({ ...containerConfig, database: 'ecomapi', user: 'ecomapi' })
    await createSchema(this.db)

    return this.db
  }

  /**
   * Performs necessary setup before each test.
   *
   *   - Truncates all tables
   *   - Loads sample data
   *
   * For use in Mocha `beforeEach` hook or similar test hook.
   */
  async beforeEach () {
    await this._loadSampleData()
  }

  /**
   * Performs necessary teardown after tests.
   *
   *   - Closes database handle
   *   - Stops and removes container
   *
   * For use in Mocha `after` hook or similar test hook.
   */
  async after () {
    // Close database handle
    await this.db.$pool.end()

    // Stop and remove container
    await this.stop()
  }
}

/**
 * @typedef config object containing database connection parameters.
 * @type {object}
 * @property {string} host database host
 * @property {int}    port database port
 * @property {string} user database user
 * @property {string} password database password
 */

/**
 * Create Database and user.
 *
 * The user used to connect to the database must have the necessary privileges to create
 * databases `CREATEDB` and roles `CREATEROLE`.
 *
 * @param {pgPromise.IDatabase} db - a database handle to use.
 * @param {string} database - name of database to create.
 * @param {string} user - name of user to create.
 * @param {string} password - password of new user.
 * @returns a Promise that resolves/rejects based on whether the database has been created.
 */
async function createDatabaseAndUser (db, database, user, password) {
  let conn

  try {
    // Use a single connection to create user and database
    conn = await db.connect({ direct: true })

    // Check if role/user already exists
    try {
      await conn.one('SELECT rolname FROM pg_roles WHERE rolname=$1', [user], r => r)
    } catch (err) {
      if ((err instanceof pgPromise.errors.QueryResultError) && err.code === pgPromise.errors.queryResultErrorCode.noData) {
        // Create user
        await conn.none('CREATE ROLE $1:name WITH LOGIN PASSWORD $2', [user, password])
      } else {
        throw new Error(err)
      }
    }

    // Check if database already exists
    try {
      await conn.one('SELECT datname FROM pg_database WHERE datname=$1', [database])
    } catch (err) {
      if ((err instanceof pgPromise.errors.QueryResultError) && err.code === pgPromise.errors.queryResultErrorCode.noData) {
        // Create database
        await conn.none('CREATE DATABASE $1:name WITH OWNER $2:name', [database, user])
      } else {
        throw new Error(err)
      }
    }
  } catch (err) {
    throw new Error(err)
  } finally {
    if (conn !== null) {
      await conn.done()
    }
  }
}

export { PostgresContainer }
