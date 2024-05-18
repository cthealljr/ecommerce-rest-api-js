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

/**
 * OrderItemsRepo provides access to order items.
 */
class OrderItemsRepo extends BaseRepo {
  /**
   * Create a new instance of OrderItemsRepo
   * @param {pgPromise.IDatabase} db - database handle
   * @param {pgPromise.IMain} pgp - reference to initialized pg-promise
   */
  constructor (db, pgp) {
    super(db, pgp, 'order_items')
  }

  /**
   * Add a new order item record to the database
   * @param {object} data - user data
   * @returns {Promise<object>} a Promise that resolves to the created order item record
   */
  async add (data) {
    return super.add(data)
  }

  /**
   * Updates an existing order item record
   * @param {object} data - order item data
   * @returns {Promise<object>} a Promise that resolves to the updated user record
   */
  async update (data) {
    return super.update(data)
  }

  /**
   * Remove an order item by ID from the database
   *
   * @param {int} id - ID of order item to remove
   * @returns {Promise<null>} a Promise that resolves if the order item was removed successfully
   */
  async remove (id) {
    return super.remove(id)
  }

  /**
   * Find an order item by ID
   * @param {int} id - ID of order item to find
   * @returns {Promise<object>} a Promise that resolves to the found order item record
   */
  async findById (id) {
    return super.findById(id)
  }

  /**
   * Find order items by order ID
   * @param {int} id - ID of order to find order items for
   * @returns {Promise<object[]>} a Promise that resolves to the found order item records
   */
  async findByOrderId (orderId) {
    return super.findByMany('order_id', orderId)
  }
}

export { OrderItemsRepo }
