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
import { ProductsRepo } from '../../../../db/repos/products.js'
import utils from '../../../../utils/index.js'

import { PostgresContainer } from '../containerSetup.js'
import pgPromise from 'pg-promise'

describe('db/repos/products/ProductsRepo', function () {
  // Isolated PostgreSQL instance for this test suite
  const container = new PostgresContainer()

  /**
   * @type {ProductsRepo}
   */
  let products

  /**
   * @type {pgPromise.IDatabase}
   */
  let db

  this.timeout('60s') // working with containers requires a longer timeout

  before(async function () {
    // Start container and setup database
    db = await container.before()

    products = new ProductsRepo(db, pgp)
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
    it('add a new product', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectProductData = {
        id: 5,
        name: 'product name',
        price: 1500n,
        description: 'product description',
        created: now,
        modified: now
      }

      const productData = {
        name: 'product name',
        price: 1500n,
        description: 'product description'
      }

      const product = await products.add(productData)

      assert.deepStrictEqual(product, expectProductData)
    })

    it('created and modified fields should be overwritten', async () => {
      const now = new Date('2024-05-19T15:14:45Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 5,
        name: 'product name',
        price: 1500n,
        description: 'product description',
        created: now,
        modified: now
      }

      const productData = {
        name: 'product name',
        price: 1500n,
        description: 'product description',
        created: new Date('2024-05-19T15:13:45Z'),
        modified: new Date('2024-05-19T15:13:35Z')
      }

      const product = await products.add(productData)

      assert.deepStrictEqual(product, expectUserData)
    })
  })

  describe('update()', () => {
    it('all fields', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 1,
        name: 'product name updated',
        price: 1600n,
        description: 'product description updated',
        created,
        modified: now
      }

      // Full product data with modifications
      const product = {
        id: 1,
        name: 'product name updated',
        price: 1600n,
        description: 'product description updated',
        created,
        modified: created
      }

      const updatedUser = await products.update(product)

      assert.deepStrictEqual(updatedUser, expectUserData)
    })

    it('created column should not be updatable', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 1,
        name: 'product name updated',
        price: 1500n,
        description: 'product description',
        created,
        modified: now
      }

      // Full product data with modifications
      const product = {
        id: 1,
        name: 'product name updated',
        price: 1500n,
        description: 'product description',
        created: now,
        modified: created
      }

      const updatedUser = await products.update(product)

      assert.deepStrictEqual(updatedUser, expectUserData)
    })

    it('single field: name', async () => {
      const created = new Date('2024-05-19T15:14:45Z')
      const now = new Date('2024-05-19T15:15:35Z')

      sinon.stub(utils, 'now').returns(now)

      const expectUserData = {
        id: 1,
        name: 'product name updated',
        price: 1500n,
        description: 'product description 1',
        created,
        modified: now
      }

      // Modify product
      const updatedUser = await products.update({ id: 1, name: 'product name updated' })

      assert.deepStrictEqual(updatedUser, expectUserData)
    })
  })

  describe('remove()', () => {
    it('remove product by id', async () => {
      // Remove product
      await products.remove(4)

      // Try to look-up product
      await assert.rejects(products.findById(4), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })

    it('should not be able to remove product with references', async () => {
      // Try to remove product
      return assert.rejects(products.remove(1), (err) => {
        assert(err.message.includes('delete on table "products" violates foreign key constraint'))
        return true
      })
    })

    it('non-existent product', async () => {
      await products.remove(100)
    })
  })

  describe('findById()', () => {
    it('2', async () => {
      const now = new Date('2024-05-19T15:15:45Z')

      const expectUserData = {
        id: 2,
        name: 'product name 2',
        price: 1501n,
        description: 'product description 2',
        created: now,
        modified: now
      }

      const foundProduct = await products.findById(2)

      assert.deepStrictEqual(foundProduct, expectUserData)
    })

    it('non-existent product', async () => {
      return assert.rejects(products.findById(100), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })
  })

  describe('findByName()', () => {
    it('product name 3', async () => {
      const now = new Date('2024-05-19T15:16:45Z')
      const expectUserData = {
        id: 3,
        name: 'product name 3',
        price: 1502n,
        description: 'product description 3',
        created: now,
        modified: now
      }

      const foundProduct = await products.findByName('product name 3')

      assert.deepStrictEqual(foundProduct, expectUserData)
    })

    it('non-existent product', async () => {
      return assert.rejects(products.findByName('username4'), (err) => {
        assert.strictEqual(err.code, pgPromise.errors.queryResultErrorCode.noData)
        return true
      })
    })
  })
})
