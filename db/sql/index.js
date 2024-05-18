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

import { dirname, join } from 'path'
import pgPromise from 'pg-promise'
import { fileURLToPath } from 'url'

const nodeVer = process.versions.node.split('.')
const nodeMaj = +nodeVer[0]
const nodeMin = +nodeVer[1]

let moduleDirname

if ((nodeMaj === 20 && nodeMin >= 11) || (nodeMaj === 21 && nodeMin >= 2) || nodeMaj > 21) {
  // Only available on Node versions 20.11+ and 21.2+
  moduleDirname = import.meta.dirname
} else {
  // Fallback to URL processing on Node versions that do not have `import.meta.dirname`
  const modulePath = fileURLToPath(import.meta.url)
  moduleDirname = dirname(modulePath)
}

/**
 * Load an external SQL file
 * @param {string} name - path of SQL file to load (relative to this file)
 * @returns {pgPromise.QueryFile}
 */
function loadLocalSQLFile (name) {
  const fullPath = join(moduleDirname, name)
  return loadSQLFile(fullPath)
}

/**
 * Load an external SQL file
 * @param {string} name - path of SQL file to load (must be a full path)
 * @returns {pgPromise.QueryFile}
 */
function loadSQLFile (name) {
  const qf = new pgPromise.QueryFile(name, {
    minify: true
  })

  if (qf.error) {
    console.error(qf.error)
  }

  return qf
}

/**
 * External SQL files for the various database tables
 */
const sql = {

  /**
   * External SQL files for the users table
   */
  users: {
    create: loadLocalSQLFile('users/create.sql')
  },

  /**
   * External SQL files for the products table
   */
  products: {
    create: loadLocalSQLFile('products/create.sql')
  },

  /**
   * External SQL files for the orders table
   */
  orders: {
    create: loadLocalSQLFile('orders/create.sql')
  },

  /**
   * External SQL files for the order_items table
   */
  orderItems: {
    create: loadLocalSQLFile('orderItems/create.sql')
  },

  /**
   * External SQL files for the carts table
   */
  carts: {
    create: loadLocalSQLFile('carts/create.sql')
  },

  /**
   * External SQL files for the cart_items table
   */
  cartItems: {
    create: loadLocalSQLFile('cartItems/create.sql'),
    selectWithProductInfo: loadLocalSQLFile('cartItems/selectWithProductInfo.sql')
  }
}

export { sql, loadSQLFile }
