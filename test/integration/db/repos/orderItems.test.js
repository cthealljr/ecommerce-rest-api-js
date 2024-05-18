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
import { OrderItemsRepo } from '../../../../db/repos/orderItems.js'
import utils from '../../../../utils/index.js'

import { PostgresContainer } from '../containerSetup.js'
import pgPromise from 'pg-promise'

describe('db/repos/orderItems/OrderItemsRepo', function () {
  // Isolated PostgreSQL instance for this test suite
  const container = new PostgresContainer()

  /**
   * @type {OrderItemsRepo}
   */
  let orderItems

  /**
   * @type {pgPromise.IDatabase}
   */
  let db

  this.timeout('60s') // working with containers requires a longer timeout

  before(async function () {
    // Start container and setup database
    db = await container.before()

    orderItems = new OrderItemsRepo(db, pgp)
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
    it('add a new order item', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderItemData = {
        id: 4,
        order_id: 1,
        product_id: 1,
        qty: 1,
        price: 1500n,
        name: 'product name 4',
        description: 'product description 4',
        created: now,
        modified: now
      }

      const orderItemData = {
        order_id: 1,
        product_id: 1,
        qty: 1,
        price: 1500n,
        name: 'product name 4',
        description: 'product description 4'
      }

      const orderItem = await orderItems.add(orderItemData)

      assert.deepStrictEqual(orderItem, expectOrderItemData)
    })

    it('created and modified fields should be overwritten', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderItemData = {
        id: 4,
        order_id: 1,
        product_id: 1,
        qty: 1,
        price: 1500n,
        name: 'product name 4',
        description: 'product description 4',
        created: now,
        modified: now
      }

      const orderItemData = {
        order_id: 1,
        product_id: 1,
        qty: 1,
        price: 1500n,
        name: 'product name 4',
        description: 'product description 4',
        created: new Date('2024-05-19T15:13:45Z'),
        modified: new Date('2024-05-19T15:13:35Z')
      }

      const orderItem = await orderItems.add(orderItemData)

      assert.deepStrictEqual(orderItem, expectOrderItemData)
    })
  })

  describe('update()', () => {
    it('all fields', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderItemData = {
        id: 1,
        order_id: 2,
        product_id: 2,
        qty: 2,
        price: 1600n,
        name: 'product name 1.1',
        description: 'product description 1.1',
        created,
        modified: now
      }

      const updatedItem = {
        id: 1,
        order_id: 2,
        product_id: 2,
        qty: 2,
        price: 1600n,
        name: 'product name 1.1',
        description: 'product description 1.1',
        created,
        modified: created
      }

      const updatedOrderItem = await orderItems.update(updatedItem)

      assert.deepStrictEqual(updatedOrderItem, expectOrderItemData)
    })

    it('created column should not be updatable', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderItemData = {
        id: 1,
        order_id: 1,
        product_id: 1,
        qty: 2,
        price: 1500n,
        name: 'product name 1',
        description: 'product description 1',
        created,
        modified: now
      }

      const updatedOrderItem = await orderItems.update({ id: 1, qty: 2, created: now })

      assert.deepStrictEqual(updatedOrderItem, expectOrderItemData)
    })

    it('single field: name', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderItemData = {
        id: 1,
        order_id: 1,
        product_id: 1,
        qty: 1,
        price: 1500n,
        name: 'product name updated',
        description: 'product description 1',
        created,
        modified: now
      }

      // Modify order
      const updatedOrderItem = await orderItems.update({ id: 1, name: 'product name updated' })

      assert.deepStrictEqual(updatedOrderItem, expectOrderItemData)
    })
  })

  describe('remove()', () => {
    it('remove order item by id', async () => {
      // Remove order
      await orderItems.remove(1)

      // Try to look-up order
      await assert.rejects(orderItems.findById(1), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('non-existent order', async () => {
      await orderItems.remove(100)
    })
  })

  describe('findById()', () => {
    it('2', async () => {
      const now = new Date('2024-05-19T15:15:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectOrderItemData = {
        id: 2,
        order_id: 2,
        product_id: 3,
        qty: 1,
        price: 1502n,
        name: 'product name 3',
        description: 'product description 3',
        created: now,
        modified: now
      }

      const foundOrderItem = await orderItems.findById(2)

      assert.deepStrictEqual(foundOrderItem, expectOrderItemData)
    })

    it('non-existent order item', async () => {
      return assert.rejects(orderItems.findById(100), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })
  })

  describe('findByOrderId', () => {
    it('no items for order', async () => {
      return assert.rejects(orderItems.findByOrderId(4), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('2', async () => {
      const expectOrderItems = [
        {
          id: 2,
          order_id: 2,
          product_id: 3,
          qty: 1,
          price: 1502n,
          name: 'product name 3',
          description: 'product description 3',
          created: new Date('2024-05-19T15:15:45Z'),
          modified: new Date('2024-05-19T15:15:45Z')
        }
      ]

      const foundOrderItems = await orderItems.findByOrderId(2)

      assert.deepStrictEqual(foundOrderItems, expectOrderItems)
    })
  })
})
