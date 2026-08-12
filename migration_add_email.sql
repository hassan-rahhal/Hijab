-- Run this ONLY if you already created the orders table from an earlier
-- schema.sql or migration_add_orders.sql. If setting up fresh, just use schema.sql.

USE hijab_home;

ALTER TABLE orders
  ADD COLUMN email VARCHAR(150) NOT NULL DEFAULT '' AFTER full_name;
