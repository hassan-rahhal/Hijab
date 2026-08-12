-- Run this if you already have a database from before.
-- Safe to run even if you have real products/orders — nothing existing is deleted.

USE hijab_home;

CREATE TABLE IF NOT EXISTS product_sizes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    size VARCHAR(10) NOT NULL,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_size (product_id, size)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER total;

-- Give every EXISTING product a single "One Size" bucket matching its current
-- flat stock number, so nothing shows as out-of-stock until you set real
-- sizes for it in the admin panel.
INSERT IGNORE INTO product_sizes (product_id, size, stock)
SELECT id, 'One Size', stock FROM products;
