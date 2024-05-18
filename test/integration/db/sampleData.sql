-- Populate users table with sample users
INSERT INTO users (username, password, first_name, last_name, created, modified) VALUES
-- id: 1
('username 1', 'passwd1', 'first name 1', 'last name 1', '2024-05-19T15:14:45+0', '2024-05-19T15:14:45+0'),
-- id: 2
('username 2', 'passwd2', 'first name 2', 'last name 2', '2024-05-19T15:15:45+0', '2024-05-19T15:15:45+0'),
-- id: 3
('username 3', 'passwd3', null, null, '2024-05-19T15:16:45+0', '2024-05-19T15:16:45+0'),
-- id: 4 (user with no references)
('username 4', 'passwd4', 'first name 4', 'last name 4', '2024-05-19T15:17:45+0', '2024-05-19T15:17:45+0');

-- Populate products table with sample products
INSERT INTO products (name, description, price, created, modified) VALUES
-- id: 1
('product name 1', 'product description 1', 1500, '2024-05-19T15:14:45+0', '2024-05-19T15:14:45+0'),
-- id: 2
('product name 2', 'product description 2', 1501, '2024-05-19T15:15:45+0', '2024-05-19T15:15:45+0'),
-- id: 3
('product name 3', 'product description 3', 1502, '2024-05-19T15:16:45+0', '2024-05-19T15:16:45+0'),
-- id: 4 (product with no references)
('product name 4', 'product description 4', 1503, '2024-05-19T15:17:45+0', '2024-05-19T15:17:45+0');

-- Populate orders table with sample orders
INSERT INTO orders (user_id, total, status, created, modified) VALUES
-- id: 1
(1, 1500, 'pending', '2024-05-19T15:14:45+0', '2024-05-19T15:14:45+0'),
-- id: 2
(2, 1502, 'cancelled', '2024-05-19T15:15:45+0', '2024-05-19T15:15:45+0'),
-- id: 3
(3, 1500, 'complete', '2024-05-19T15:16:45+0', '2024-05-19T15:16:45+0'),
-- id: 4 (order with no items)
(3, 1500, 'pending', '2024-05-19T15:17:45+0', '2024-05-19T15:17:45+0');

-- Populate order_items table with sample order items
INSERT INTO order_items (order_id, product_id, name, description, qty, price, created, modified) VALUES
-- id: 1
(1, 1, 'product name 1', 'product description 1', 1, 1500, '2024-05-19T15:14:45+0', '2024-05-19T15:14:45+0'),
-- id: 2
(2, 3, 'product name 3', 'product description 3', 1, 1502, '2024-05-19T15:15:45+0', '2024-05-19T15:15:45+0'),
-- id: 3
(3, 2, 'product name 2', 'product description 2', 1, 1501, '2024-05-19T15:16:45+0', '2024-05-19T15:16:45+0');

-- Populate carts table with sample carts
INSERT INTO carts (user_id, created, modified) VALUES
-- id: 1
(1, '2024-05-19T15:14:45+0', '2024-05-19T15:14:45+0'),
-- id: 2
(2, '2024-05-19T15:15:45+0', '2024-05-19T15:15:45+0');

-- Populate cart_items table with sample cart items
INSERT INTO cart_items (cart_id, product_id, qty, created, modified) VALUES
-- id: 1
(1, 1, 1, '2024-05-19T15:14:45+0', '2024-05-19T15:14:45+0');
