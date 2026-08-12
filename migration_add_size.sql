-- Run this ONLY if you already created the database from the earlier schema.sql
-- and don't want to drop your existing carts/products.
-- If you haven't set up the database yet, just re-run the updated schema.sql instead.

USE hijab_home;

ALTER TABLE cart_items
  ADD COLUMN size VARCHAR(10) NOT NULL DEFAULT 'One Size' AFTER product_id;

ALTER TABLE cart_items
  DROP INDEX unique_cart_product,
  ADD UNIQUE KEY unique_cart_product_size (cart_id, product_id, size);
