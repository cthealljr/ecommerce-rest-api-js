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

// pgPromise is only imported for type references
// eslint-disable-next-line no-unused-vars
import pgPromise from 'pg-promise'

import utils from '../../utils/index.js'

/**
 * BaseRepo base class for repositories.
 */
class BaseRepo {
  /**
   * Create a new instance of UsersRepo
   * @param {pgPromise.IDatabase} db - database handle
   * @param {pgPromise.IMain} pgp - reference to initialized pg-promise
   * @param {string} tableName - name of table
   */
  constructor (db, pgp, tableName) {
    /**
     * Database handle
     * @type {pgPromise.IDatabase}
     */
    this.db = db

    /**
     * Reference to initialized pg-promise
     * @type {pgPromise.IMain}
     */
    this.pgp = pgp

    /**
     * Name of table
     * @type {string}
     */
    this.tableName = tableName
  }

  /**
   * Add a new record to the database
   * @param {object} data - record data
   * @returns {Promise<object>} a Promise that resolves to the created record
   */
  async add (data) {
    // Set created and modified dates to current date (overwrite any existing value)
    data.created = utils.now()
    data.modified = data.created

    // Generate SQL Statement
    const statement = this.pgp.helpers.insert(data, null, this.tableName) + 'RETURNING *;'

    // Execute SQL Statement
    return this.db.one(statement)
  }

  /**
   * Updates an existing record
   * @param {object} data - record data
   * @returns {Promise<object>} a Promise that resolves to the updated record
   */
  async update (data) {
    const { id, ...params } = data

    // Set modified date to current date (overwrite any existing value)
    params.modified = utils.now()

    // Ensure params.created is not present as it should not be updated
    if (params.created) {
      delete params.created
    }

    // Generate SQL Statement
    const condition = this.pgp.as.format('WHERE id=$(id) RETURNING *', { id })
    const statement = this.pgp.helpers.update(params, null, this.tableName) + condition

    // Execute SQL Statement
    return this.db.one(statement)
  }

  /**
   * Remove a record from the database by ID
   * @param {int} id - ID of record to remove
   * @returns {Promise<null>} a Promise that resolves if the record was removed successfully
   */
  async remove (id) {
    return this.db.none('DELETE FROM $1:name WHERE id=$2', [this.tableName, id])
  }

  /**
   * Find a record by ID
   * @param {int} id - ID of record to find
   * @returns {Promise<object>} a Promise that resolves to the found record
   */
  async findById (id) {
    return this.db.one('SELECT * FROM $1:name WHERE id=$2', [this.tableName, id])
  }

  /**
   * Find a single record by value in column
   * @param {string} column - name of column to find by
   * @param {string} value - value to find by
   * @returns {Promise<object>} a Promise that resolves to the found record
   */
  async findByOne (column, value) {
    return this.db.one('SELECT * FROM $1:name WHERE $2:name=$3', [this.tableName, column, value])
  }

  /**
   * Find one or more records by value in column
   * @param {string} column - name of column to find by
   * @param {string} value - value to find by
   * @returns {Promise<object>} a Promise that resolves to the found records
   */
  async findByMany (column, value) {
    return this.db.many('SELECT * FROM $1:name WHERE $2:name=$3', [this.tableName, column, value])
  }
}

export { BaseRepo }
