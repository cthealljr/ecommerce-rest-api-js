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
import { CartItemsRepo } from '../../../../db/repos/cartItems.js'
import utils from '../../../../utils/index.js'

import { PostgresContainer } from '../containerSetup.js'
import pgPromise from 'pg-promise'

describe('db/repos/orderItems/CartItemsRepo', function () {
  // Isolated PostgreSQL instance for this test suite
  const container = new PostgresContainer()

  /**
   * @type {CartItemsRepo}
   */
  let cartItems

  /**
   * @type {pgPromise.IDatabase}
   */
  let db

  this.timeout('60s') // working with containers requires a longer timeout

  before(async function () {
    // Start container and setup database
    db = await container.before()

    cartItems = new CartItemsRepo(db, pgp)
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
    it('add a new cart item', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectCartItemData = {
        id: 2,
        cart_id: 1,
        product_id: 1,
        qty: 1,
        created: now,
        modified: now
      }

      const cartItemData = {
        cart_id: 1,
        product_id: 1,
        qty: 1
      }

      const cartItem = await cartItems.add(cartItemData)

      assert.deepStrictEqual(cartItem, expectCartItemData)
    })

    it('created and modified fields should be overwritten', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectCartItemData = {
        id: 2,
        cart_id: 1,
        product_id: 1,
        qty: 1,
        created: now,
        modified: now
      }

      const cartItemData = {
        cart_id: 1,
        product_id: 1,
        qty: 1,
        created: new Date('2024-05-19T15:13:45Z'),
        modified: new Date('2024-05-19T15:13:35Z')
      }

      const cartItem = await cartItems.add(cartItemData)

      assert.deepStrictEqual(cartItem, expectCartItemData)
    })
  })

  describe('update()', () => {
    it('all fields', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectCartItemData = {
        id: 1,
        cart_id: 2,
        product_id: 2,
        qty: 2,
        created,
        modified: now
      }

      const updatedItem = {
        id: 1,
        cart_id: 2,
        product_id: 2,
        qty: 2,
        created,
        modified: created
      }

      const updatedCartItem = await cartItems.update(updatedItem)

      assert.deepStrictEqual(updatedCartItem, expectCartItemData)
    })

    it('created column should not be updatable', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectCartItemData = {
        id: 1,
        cart_id: 1,
        product_id: 1,
        qty: 2,
        created,
        modified: now
      }

      const updatedCartItem = await cartItems.update({ id: 1, qty: 2, created: now })

      assert.deepStrictEqual(updatedCartItem, expectCartItemData)
    })

    it('single field: qty', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectCartItemData = {
        id: 1,
        cart_id: 1,
        product_id: 1,
        qty: 2,
        created,
        modified: now
      }

      // Modify cart item
      const updatedCartItem = await cartItems.update({ id: 1, qty: 2 })

      assert.deepStrictEqual(updatedCartItem, expectCartItemData)
    })
  })

  describe('remove()', () => {
    it('remove order item by id', async () => {
      // Remove order
      await cartItems.remove(1)

      // Try to look-up order
      await assert.rejects(cartItems.findById(1), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('non-existent order', async () => {
      await cartItems.remove(100)
    })
  })

  describe('findById()', () => {
    it('1', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectCartItemData = {
        id: 1,
        cart_id: 1,
        product_id: 1,
        qty: 1,
        name: 'product name 1',
        price: 1500n,
        created: now,
        modified: now
      }

      const foundCartItem = await cartItems.findById(1)

      assert.deepStrictEqual(foundCartItem, expectCartItemData)
    })

    it('non-existent order item', async () => {
      return assert.rejects(cartItems.findById(100), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })
  })

  describe('findByCartId', () => {
    it('no items for cart', async () => {
      return assert.rejects(cartItems.findByCartId(2), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('1', async () => {
      const expectCartItems = [
        {
          id: 1,
          cart_id: 1,
          product_id: 1,
          qty: 1,
          name: 'product name 1',
          price: 1500n,
          created: new Date('2024-05-19T15:14:45Z'),
          modified: new Date('2024-05-19T15:14:45Z')
        }
      ]

      const foundCartItems = await cartItems.findByCartId(1)

      assert.deepStrictEqual(foundCartItems, expectCartItems)
    })
  })
})
