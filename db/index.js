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

import pgPromise from 'pg-promise'

// import { UsersRepo, ProductsRepo, OrdersRepo, OrderItemsRepo, CartsRepo, CartItemsRepo } from "./repos/index.js"

const pgp = pgPromise({
  capSQL: true
  // Consider using the following
  // extend: (obj, dc) => {
  //     obj.users = new UsersRepo(obj, obj.$config.pgp)
  //     obj.products = new ProductsRepo(obj, obj.$config.pgp)
  //     obj.orders = new OrdersRepo(obj, obj.$config.pgp)
  //     obj.orderItems = new OrderItemsRepo(obj, obj.$config.pgp)
  //     obj.carts = new CartsRepo(obj, obj.$config.pgp)
  //     obj.cartItems = new CartItemsRepo(obj, obj.$config.pgp)
  // }
})

// Enable parsing of BigInt values
pgp.pg.types.setTypeParser(20, BigInt)

/**
 * @type {pgPromise.IDatabase}
 */
let db = null

/**
 * An object containing database connection parameters.
 * @typedef config
 * @type {object}
 * @property {string} DB_NAME - database name
 * @property {string} DB_HOST - database host
 * @property {int} DB_PORT - database port
 * @property {string} DB_USER - database user
 * @property {string} DB_PASS - database password
 */

/**
 * Connect to the database
 *
 * Only the first call to connect() will create the database handle, subsequent calls will silently be ignored.
 *
 * @param {config} config - an object containing database connection parameters.
 */
const connect = (config) => {
  if (db === null) {
    db = pgp({
      database: config.DB_NAME,
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASS
    })
  }
}

/**
 * Get database handle.
 *
 * connect() must be called before the database handle can be used.
 *
 * @returns {pgPromise.IDatabase} database handle
 *
 * @throws an instance of Error when the database handle is null
 */
const getDB = () => {
  if (db === null) {
    throw new Error('Database handle is null, did you call connect() first?')
  }

  return db
}

/**
 * Close any remaining database connections and set the database handle to null.
 */
const end = () => {
  if (db !== null) {
    pgp.end()
    db = null
  }
}

export { pgp, connect, end, getDB }
