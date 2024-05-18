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
import { CartsRepo } from '../../../../db/repos/carts.js'
import utils from '../../../../utils/index.js'

import { PostgresContainer } from '../containerSetup.js'
import pgPromise from 'pg-promise'

describe('db/repos/carts/CartsRepo', function () {
  // Isolated PostgreSQL instance for this test suite
  const container = new PostgresContainer()

  /**
   * @type {CartsRepo}
   */
  let carts

  /**
   * @type {pgPromise.IDatabase}
   */
  let db

  this.timeout('60s') // working with containers requires a longer timeout

  before(async function () {
    // Start container and setup database
    db = await container.before()

    carts = new CartsRepo(db, pgp)
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
    it('add a new cart', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 3,
        user_id: 1,
        created: now,
        modified: now
      }

      const cartData = {
        user_id: 1
      }

      const cart = await carts.add(cartData)

      assert.deepStrictEqual(cart, expectOrderData)
    })

    it('created and modified fields should be overwritten', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 3,
        user_id: 1,
        created: now,
        modified: now
      }

      const cartData = {
        user_id: 1,
        created: new Date('2024-05-19T15:13:45Z'),
        modified: new Date('2024-05-19T15:13:35Z')
      }

      const cart = await carts.add(cartData)

      assert.deepStrictEqual(cart, expectOrderData)
    })
  })

  describe('update()', () => {
    it('all fields', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 1,
        user_id: 2,
        created,
        modified: now
      }

      const updatedOrder = await carts.update({ id: 1, user_id: 2, created, modified: created })

      assert.deepStrictEqual(updatedOrder, expectOrderData)
    })

    it('created column should not be updatable', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 1,
        user_id: 2,
        created,
        modified: now
      }

      const updatedOrder = await carts.update({ id: 1, user_id: 2, created: now })

      assert.deepStrictEqual(updatedOrder, expectOrderData)
    })

    it('single field: user_id', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 1,
        user_id: 2,
        created,
        modified: now
      }

      // Modify cart
      const updatedOrder = await carts.update({ id: 1, user_id: 2 })

      assert.deepStrictEqual(updatedOrder, expectOrderData)
    })
  })

  describe('remove()', () => {
    it('remove cart by id', async () => {
      // Remove cart
      await carts.remove(1)

      // Try to look-up cart
      await assert.rejects(carts.findById(1), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('non-existent cart', async () => {
      await carts.remove(100)
    })
  })

  describe('findById()', () => {
    it('2', async () => {
      const now = new Date('2024-05-19T15:15:45Z')

      const expectOrderData = {
        id: 2,
        user_id: 2,
        created: now,
        modified: now
      }

      const foundOrder = await carts.findById(2)

      assert.deepStrictEqual(foundOrder, expectOrderData)
    })

    it('non-existent cart', async () => {
      return assert.rejects(carts.findById(100), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })
  })

  describe('findByUserId', () => {
    it('no carts for user', async () => {
      return assert.rejects(carts.findByUserId(4), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('2', async () => {
      const expectOrders = [
        {
          id: 2,
          user_id: 2,
          created: new Date('2024-05-19T15:15:45Z'),
          modified: new Date('2024-05-19T15:15:45Z')
        }
      ]

      const foundOrders = await carts.findByUserId(2)

      assert.deepStrictEqual(foundOrders, expectOrders)
    })
  })
})
