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

import { sql } from './sql/index.js'

/**
 * Create Database Schema.
 * @param {pgPromise.IDatabase} db - a database handle to use.
 * @returns a Promise that resolves/rejects based on whether the database schema has been created.
 */
async function createSchema (db) {
  let conn

  try {
    // Use a single connection to create tables
    conn = await db.connect({ direct: true })

    // Create database tables
    await conn.none(sql.users.create)
    await conn.none(sql.products.create)
    await conn.none(sql.orders.create)
    await conn.none(sql.orderItems.create)
    await conn.none(sql.carts.create)
    await conn.none(sql.cartItems.create)
  } catch (err) {
    throw new Error(err)
  } finally {
    if (conn !== null) {
      await conn.done()
    }
  }
}

export { createSchema }
