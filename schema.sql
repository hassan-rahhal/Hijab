-- Hijab Home database schema
-- Run this if you want to create tables manually instead of Laravel migrations

CREATE DATABASE IF NOT EXISTS hijab_home CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hijab_home;

CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    image_url VARCHAR(500) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT UNSIGNED DEFAULT 0,
    image_url VARCHAR(500) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    size VARCHAR(10) NOT NULL DEFAULT 'One Size',
    color VARCHAR(40) NOT NULL DEFAULT 'Default',
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product_size_color (cart_id, product_id, size, color)
);

CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    notes TEXT,
    total DECIMAL(10,2) NOT NULL,
    delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    size VARCHAR(10) NOT NULL DEFAULT 'One Size',
    color VARCHAR(40) NOT NULL DEFAULT 'Default',
    quantity INT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE product_sizes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    size VARCHAR(10) NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_size (product_id, size)
);

CREATE TABLE product_colors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(40) NOT NULL,
    hex VARCHAR(7) DEFAULT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_color (product_id, name)
);

CREATE TABLE product_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed the 4 categories from the site
INSERT INTO categories (name, slug, sort_order) VALUES
('Abaya', 'abaya', 1),
('Echarpe', 'echarpe', 2),
('Sets', 'sets', 3),
('Accessories', 'accessories', 4);

-- Sample products so the shop page isn't empty (edit prices/stock/images as needed)
INSERT INTO products (category_id, name, slug, price, stock, image_url) VALUES
(1, 'Layered Abaya', 'layered-abaya', 78.00, 6, NULL),
(1, 'Classic Black Abaya', 'classic-black-abaya', 85.00, 8, NULL),
(2, 'Printed Chiffon Echarpe', 'printed-chiffon-echarpe', 22.00, 15, NULL),
(2, 'Plain Jersey Echarpe', 'plain-jersey-echarpe', 18.00, 20, NULL),
(3, 'Belted Co-ord Set', 'belted-co-ord-set', 110.00, 3, NULL),
(3, 'Peplum Two-Piece Set', 'peplum-two-piece-set', 120.00, 5, NULL),
(4, 'Pearl Pin Set', 'pearl-pin-set', 12.00, 25, NULL),
(4, 'Everyday Underscarf', 'everyday-underscarf', 8.00, 30, NULL);

-- Per-size availability for each sample product (product_id order matches inserts above: 1-8)
INSERT INTO product_sizes (product_id, size, in_stock) VALUES
(1, 'S', 1), (1, 'M', 1), (1, 'L', 1),
(2, 'S', 1), (2, 'M', 1), (2, 'L', 0),
(3, 'One Size', 1),
(4, 'One Size', 1),
(5, 'S', 0), (5, 'M', 1), (5, 'L', 1),
(6, 'S', 1), (6, 'M', 1), (6, 'L', 1),
(7, 'One Size', 1),
(8, 'One Size', 1);
