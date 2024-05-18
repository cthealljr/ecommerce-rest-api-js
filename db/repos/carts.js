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
 * CartsRepo provides access to carts.
 */
class CartsRepo extends BaseRepo {
  /**
   * Create a new instance of CartsRepo
   * @param {pgPromise.IDatabase} db - database handle
   * @param {pgPromise.IMain} pgp - reference to initialized pg-promise
   */
  constructor (db, pgp) {
    super(db, pgp, 'carts')
  }

  /**
   * Add a new cart record to the database
   * @param {object} data - user data
   * @returns {Promise<object>} a Promise that resolves to the created cart record
   */
  async add (data) {
    return super.add(data)
  }

  /**
   * Updates an existing cart record
   * @param {object} data - cart data
   * @returns {Promise<object>} a Promise that resolves to the updated user record
   */
  async update (data) {
    return super.update(data)
  }

  /**
   * Remove a cart by ID from the database
   *
   * If the cart contains any items those items will also be removed.
   *
   * @param {int} id - ID of cart to remove
   * @returns {Promise<null>} a Promise that resolves if the cart was removed successfully
   */
  async remove (id) {
    return super.remove(id)
  }

  /**
   * Find a cart by ID
   * @param {int} id - ID of cart to find
   * @returns {Promise<object>} a Promise that resolves to the found cart record
   */
  async findById (id) {
    return super.findById(id)
  }

  /**
   * Find carts by user ID
   * @param {int} id - ID of user to find carts for
   * @returns {Promise<object[]>} a Promise that resolves to the found cart records
   */
  async findByUserId (userId) {
    return super.findByMany('user_id', userId)
  }
}

export { CartsRepo }
