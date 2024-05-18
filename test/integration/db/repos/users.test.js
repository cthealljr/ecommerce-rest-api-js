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

/* eslint-env mocha */

import assert from 'assert'

import sinon from 'sinon'

import { pgp } from '../../../../db/index.js'
import { UsersRepo } from '../../../../db/repos/users.js'
import utils from '../../../../utils/index.js'

import { PostgresContainer } from '../containerSetup.js'
import pgPromise from 'pg-promise'

describe('db/repos/user/UsersRepo', function () {
  // Isolated PostgreSQL instance for this test suite
  const container = new PostgresContainer()

  /**
   * @type {UsersRepo}
   */
  let users

  /**
   * @type {pgPromise.IDatabase}
   */
  let db

  this.timeout('60s') // working with containers requires a longer timeout

  before(async function () {
    // Start container and setup database
    db = await container.before()

    users = new UsersRepo(db, pgp)
  })

  this.beforeEach(async () => {
    // Truncate tables and load sample data
    await container.beforeEach()
  })

  afterEach(async () => {
    sinon.restore()
  })

  after(async () => {
    // Close database, stop and remove container
    await container.after()
  })

  describe('add()', () => {
    it('add a new user', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 5,
        username: 'user1',
        password: 'pass',
        first_name: 'first name',
        last_name: 'last name',
        created: now,
        modified: now
      }

      const userData = {
        username: 'user1',
        password: 'pass',
        first_name: 'first name',
        last_name: 'last name'
      }

      const user = await users.add(userData)

      assert.deepStrictEqual(user, expectUserData)
    })

    it('created and modified fields should be overwritten', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 5,
        username: 'user1',
        password: 'pass',
        first_name: 'first name',
        last_name: 'last name',
        created: now,
        modified: now
      }

      const userData = {
        username: 'user1',
        password: 'pass',
        first_name: 'first name',
        last_name: 'last name',
        created: new Date('2024-05-19T15:13:45Z'),
        modified: new Date('2024-05-19T15:13:35Z')
      }

      const user = await users.add(userData)

      assert.deepStrictEqual(user, expectUserData)
    })

    it('username must be unique', async () => {
      const userData = {
        username: 'username 1',
        password: 'pass',
        first_name: 'first name',
        last_name: 'last name'
      }

      // Try to create duplicate username
      await assert.rejects(users.add(userData), (err) => {
        assert(err.message.includes('duplicate key value violates unique constraint "users_username_key"'))
        return true
      })
    })
  })

  describe('update()', () => {
    it('all fields', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 1,
        username: 'user1',
        password: 'passwd',
        first_name: 'first name updated',
        last_name: 'last name updated',
        created,
        modified: now
      }

      // user data
      const userData = {
        id: 1,
        username: 'user1',
        password: 'passwd',
        first_name: 'first name updated',
        last_name: 'last name updated'
      }

      const updatedUser = await users.update(userData)

      assert.deepStrictEqual(updatedUser, expectUserData)
    })

    it('created column should not be updatable', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 1,
        username: 'username 1',
        password: 'passwd1',
        first_name: 'first name updated',
        last_name: 'last name 1',
        created,
        modified: now
      }

      // user data
      const userData = {
        id: 1,
        username: 'username 1',
        password: 'passwd1',
        first_name: 'first name updated',
        last_name: 'last name 1',
        created: now
      }

      const updatedUser = await users.update(userData)

      assert.deepStrictEqual(updatedUser, expectUserData)
    })

    it('single field: first_name', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 1,
        username: 'username 1',
        password: 'passwd1',
        first_name: 'first name updated',
        last_name: 'last name 1',
        created,
        modified: now
      }

      // Modify user
      const updatedUser = await users.update({ id: 1, first_name: 'first name updated' })

      assert.deepStrictEqual(updatedUser, expectUserData)
    })
  })

  describe('remove()', () => {
    it('remove user by id', async () => {
      // Remove user
      await users.remove(4)

      // Try to look-up user
      await assert.rejects(users.findById(4), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('should not be able to remove user with references', async () => {
      // Try to remove user
      return assert.rejects(users.remove(1), (err) => {
        assert(err.message.includes('delete on table "users" violates foreign key constraint'))
        return true
      })
    })

    it('non-existent user', async () => {
      await users.remove(100)
    })
  })

  describe('findById()', () => {
    it('2', async () => {
      const now = new Date('2024-05-19T15:15:45Z')

      const expectUserData = {
        id: 2,
        username: 'username 2',
        password: 'passwd2',
        first_name: 'first name 2',
        last_name: 'last name 2',
        created: now,
        modified: now
      }

      const foundUser = await users.findById(2)

      assert.deepStrictEqual(foundUser, expectUserData)
    })

    it('non-existent user', async () => {
      return assert.rejects(users.findById(100), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })
  })

  describe('findByUsername()', () => {
    it('username 3', async () => {
      const now = new Date('2024-05-19T15:16:45Z')

      const expectUserData = {
        id: 3,
        username: 'username 3',
        password: 'passwd3',
        first_name: null,
        last_name: null,
        created: now,
        modified: now
      }

      const foundUser = await users.findByUsername('username 3')

      assert.deepStrictEqual(foundUser, expectUserData)
    })

    it('non-existent user', async () => {
      return assert.rejects(users.findByUsername('username4'), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })
  })
})
