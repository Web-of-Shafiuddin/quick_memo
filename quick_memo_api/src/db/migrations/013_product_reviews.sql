-- Migration: Add product reviews support
-- Modifies shop_reviews to allow product-specific reviews

-- 1. Add product_id column to shop_reviews
ALTER TABLE shop_reviews
ADD COLUMN IF NOT EXISTS product_id INT REFERENCES products(product_id) ON DELETE CASCADE;

-- 2. Update unique constraint
-- We want one shop review per order (product_id IS NULL)
-- AND one review per product per order
ALTER TABLE shop_reviews DROP CONSTRAINT IF EXISTS shop_reviews_transaction_id_key;

-- Since PostgreSQL's UNIQUE constraint treats NULL as distinct,
-- we'll use a unique index to handle shop reviews (where product_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_shop_review_per_order
ON shop_reviews (transaction_id)
WHERE product_id IS NULL;

-- Unique index for product reviews (one per product per order)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_product_review_per_order
ON shop_reviews (transaction_id, product_id)
WHERE product_id IS NOT NULL;

-- 3. Add index for product performance
CREATE INDEX IF NOT EXISTS idx_shop_reviews_product_id ON shop_reviews(product_id);
