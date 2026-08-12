-- Run this if you already have a database set up from before.
USE hijab_home;

-- 1. Convert product_sizes from a stock NUMBER to a simple in-stock TOGGLE
ALTER TABLE product_sizes ADD COLUMN in_stock BOOLEAN NOT NULL DEFAULT TRUE AFTER size;
UPDATE product_sizes SET in_stock = (stock > 0);
ALTER TABLE product_sizes DROP COLUMN stock;

-- 2. New: colors per product
CREATE TABLE IF NOT EXISTS product_colors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(40) NOT NULL,
    hex VARCHAR(7) DEFAULT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_color (product_id, name)
);

-- 3. New: multiple photos per product (in addition to the existing single products.image_url cover photo)
CREATE TABLE IF NOT EXISTS product_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Track which color a cart/order line item was for
ALTER TABLE cart_items ADD COLUMN color VARCHAR(40) NOT NULL DEFAULT 'Default' AFTER size;
ALTER TABLE cart_items DROP INDEX unique_cart_product_size;
ALTER TABLE cart_items ADD UNIQUE KEY unique_cart_product_size_color (cart_id, product_id, size, color);

ALTER TABLE order_items ADD COLUMN color VARCHAR(40) NOT NULL DEFAULT 'Default' AFTER size;
