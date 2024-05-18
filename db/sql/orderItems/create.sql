CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL,
    modified TIMESTAMP WITH TIME ZONE NOT NULL,
    qty INT NOT NULL,
    price BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);