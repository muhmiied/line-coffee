-- 012_stock_inventory.sql
-- Adds manual out-of-stock override column to products.
-- stock_quantity and low_stock_threshold already exist from 001_ecommerce_upgrade.sql.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_manually_out_of_stock boolean NOT NULL DEFAULT false;
