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

import { BaseRepo } from './base.js'
import { sql } from '../sql/index.js'

/**
 * CartItemsRepo provides access to cart items.
 */
class CartItemsRepo extends BaseRepo {
  /**
   * Create a new instance of CartItemsRepo
   * @param {pgPromise.IDatabase} db - database handle
   * @param {pgPromise.IMain} pgp - reference to initialized pg-promise
   */
  constructor (db, pgp) {
    super(db, pgp, 'cart_items')
  }

  /**
   * Add a new cart item record to the database
   * @param {object} data - user data
   * @returns {Promise<object>} a Promise that resolves to the created cart item record
   */
  async add (data) {
    return super.add(data)
  }

  /**
   * Updates an existing cart item record
   * @param {object} data - cart item data
   * @returns {Promise<object>} a Promise that resolves to the updated user record
   */
  async update (data) {
    return super.update(data)
  }

  /**
   * Remove an cart item by ID from the database
   *
   * @param {int} id - ID of cart item to remove
   * @returns {Promise<null>} a Promise that resolves if the cart item was removed successfully
   */
  async remove (id) {
    return super.remove(id)
  }

  /**
   * Find an cart item by ID
   * @param {int} id - ID of cart item to find
   * @returns {Promise<object>} a Promise that resolves to the found cart item record
   */
  async findById (id) {
    return this.db.one(sql.cartItems.selectWithProductInfo, { filterColumn: 'ci.id', filterValue: id })
  }

  /**
   * Find cart items by cart ID
   * @param {int} id - ID of cart to find cart items for
   * @returns {Promise<object[]>} a Promise that resolves to the found cart item records
   */
  async findByCartId (cartId) {
    return this.db.many(sql.cartItems.selectWithProductInfo, { filterColumn: 'cart_id', filterValue: cartId })
  }
}

export { CartItemsRepo }
