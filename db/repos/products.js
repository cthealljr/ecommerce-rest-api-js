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
 * ProductsRepo provides access to products.
 */
class ProductsRepo extends BaseRepo {
  /**
   * Create a new instance of ProductsRepo
   * @param {pgPromise.IDatabase} db - database handle
   * @param {pgPromise.IMain} pgp - reference to initialized pg-promise
   */
  constructor (db, pgp) {
    super(db, pgp, 'products')
  }

  /**
   * Add a new product record to the database
   * @param {object} data - user data
   * @returns {Promise<object>} a Promise that resolves to the created product record
   */
  async add (data) {
    return super.add(data)
  }

  /**
   * Updates an existing product record
   * @param {object} data - product data
   * @returns {Promise<object>} a Promise that resolves to the updated user record
   */
  async update (data) {
    return super.update(data)
  }

  /**
   * Remove a product by ID from the database
   *
   * If there are any references to the product the product cannot be removed.
   *
   * @param {int} id - ID of product to remove
   * @returns {Promise<null>} a Promise that resolves if the product was removed successfully
   */
  async remove (id) {
    return super.remove(id)
  }

  /**
   * Find a product by ID
   * @param {int} id - ID of product to find
   * @returns {Promise<object>} a Promise that resolves to the found product record
   */
  async findById (id) {
    return super.findById(id)
  }

  /**
   * Find a product by name
   * @param {string} name - name of product to find
   * @returns {Promise<object>} a Promise that resolves to the found product record
   */
  async findByName (name) {
    return super.findByOne('name', name)
  }
}

export { ProductsRepo }
