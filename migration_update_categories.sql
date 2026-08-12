-- Run this ONLY if you already have a populated database and want to switch
-- to the new category structure: Abaya, Echarpe, Sets, Accessories.
--
-- WARNING: This deletes all existing PRODUCTS (Dresses/Pants/Tops don't map
-- cleanly onto the new categories) and any items currently sitting in carts,
-- since cart_items references products. It does NOT touch past orders —
-- order_items keeps its own snapshot of product name/price/size, so old
-- order history stays intact even after the products themselves are removed.
--
-- If you've already added real product photos/data you want to keep, stop
-- here and manually re-map your products to new category_id values instead
-- of running this script.

USE hijab_home;

DELETE FROM products;   -- cascades to cart_items automatically
DELETE FROM categories;

ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;

INSERT INTO categories (name, slug, sort_order) VALUES
('Abaya', 'abaya', 1),
('Echarpe', 'echarpe', 2),
('Sets', 'sets', 3),
('Accessories', 'accessories', 4);

INSERT INTO products (category_id, name, slug, price, stock, image_url) VALUES
(1, 'Layered Abaya', 'layered-abaya', 78.00, 6, NULL),
(1, 'Classic Black Abaya', 'classic-black-abaya', 85.00, 8, NULL),
(2, 'Printed Chiffon Echarpe', 'printed-chiffon-echarpe', 22.00, 15, NULL),
(2, 'Plain Jersey Echarpe', 'plain-jersey-echarpe', 18.00, 20, NULL),
(3, 'Belted Co-ord Set', 'belted-co-ord-set', 110.00, 3, NULL),
(3, 'Peplum Two-Piece Set', 'peplum-two-piece-set', 120.00, 5, NULL),
(4, 'Pearl Pin Set', 'pearl-pin-set', 12.00, 25, NULL),
(4, 'Everyday Underscarf', 'everyday-underscarf', 8.00, 30, NULL);
