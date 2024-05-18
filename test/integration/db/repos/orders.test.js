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
import { OrdersRepo } from '../../../../db/repos/orders.js'
import utils from '../../../../utils/index.js'

import { PostgresContainer } from '../containerSetup.js'
import pgPromise from 'pg-promise'

describe('db/repos/orders/OrdersRepo', function () {
  // Isolated PostgreSQL instance for this test suite
  const container = new PostgresContainer()

  /**
   * @type {OrdersRepo}
   */
  let orders

  /**
   * @type {pgPromise.IDatabase}
   */
  let db

  this.timeout('60s') // working with containers requires a longer timeout

  before(async function () {
    // Start container and setup database
    db = await container.before()

    orders = new OrdersRepo(db, pgp)
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
    it('add a new order', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 5,
        user_id: 1,
        total: 1500n,
        status: 'pending',
        created: now,
        modified: now
      }

      const orderData = {
        user_id: 1,
        total: 1500n,
        status: 'pending'
      }

      const order = await orders.add(orderData)

      assert.deepStrictEqual(order, expectOrderData)
    })

    it('created and modified fields should be overwritten', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 5,
        user_id: 1,
        total: 1500n,
        status: 'pending',
        created: now,
        modified: now
      }

      const orderData = {
        user_id: 1,
        total: 1500n,
        status: 'pending',
        created: new Date('2024-05-19T15:13:45Z'),
        modified: new Date('2024-05-19T15:13:35Z')
      }

      const order = await orders.add(orderData)

      assert.deepStrictEqual(order, expectOrderData)
    })
  })

  describe('update()', () => {
    it('all fields', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 1,
        user_id: 1,
        total: 1600n,
        status: 'complete',
        created,
        modified: now
      }

      const updatedOrder = await orders.update({ id: 1, status: 'complete', total: 1600n, user_id: 1, created, modified: created })

      assert.deepStrictEqual(updatedOrder, expectOrderData)
    })

    it('created column should not be updatable', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 1,
        user_id: 1,
        total: 1500n,
        status: 'complete',
        created,
        modified: now
      }

      const updatedOrder = await orders.update({ id: 1, status: 'complete', created: now })

      assert.deepStrictEqual(updatedOrder, expectOrderData)
    })

    it('single field: status', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderData = {
        id: 1,
        user_id: 1,
        total: 1500n,
        status: 'complete',
        created,
        modified: now
      }

      // Modify order
      const updatedOrder = await orders.update({ id: 1, status: 'complete' })

      assert.deepStrictEqual(updatedOrder, expectOrderData)
    })
  })

  describe('remove()', () => {
    it('remove order by id', async () => {
      // Remove order
      await orders.remove(4)

      // Try to look-up order
      await assert.rejects(orders.findById(4), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('should not be able to remove order with references', async () => {
      // Try to remove order
      return assert.rejects(orders.remove(1), (err) => {
        assert(err.message.includes('delete on table "orders" violates foreign key constraint'))
        return true
      })
    })

    it('non-existent order', async () => {
      await orders.remove(100)
    })
  })

  describe('findById()', () => {
    it('2', async () => {
      const now = new Date('2024-05-19T15:15:45Z')

      const expectOrderData = {
        id: 2,
        user_id: 2,
        total: 1502n,
        status: 'cancelled',
        created: now,
        modified: now
      }

      const foundOrder = await orders.findById(2)

      assert.deepStrictEqual(foundOrder, expectOrderData)
    })

    it('non-existent order', async () => {
      return assert.rejects(orders.findById(100), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })
  })

  describe('findByUserId', () => {
    it('no orders for user', async () => {
      return assert.rejects(orders.findByUserId(4), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('2', async () => {
      const expectOrders = [
        {
          id: 2,
          user_id: 2,
          total: 1502n,
          status: 'cancelled',
          created: new Date('2024-05-19T15:15:45Z'),
          modified: new Date('2024-05-19T15:15:45Z')
        }
      ]

      const foundOrders = await orders.findByUserId(2)

      assert.deepStrictEqual(foundOrders, expectOrders)
    })
  })
})
