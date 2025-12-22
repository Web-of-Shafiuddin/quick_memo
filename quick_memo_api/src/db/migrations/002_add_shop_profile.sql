-- Migration: Add shop profile fields to users table
-- This adds fields for storing shop information used in order memos/invoices

ALTER TABLE users
ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shop_owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shop_mobile VARCHAR(20),
ADD COLUMN IF NOT EXISTS shop_email VARCHAR(100),
ADD COLUMN IF NOT EXISTS shop_address TEXT,
ADD COLUMN IF NOT EXISTS shop_logo_url TEXT;

-- Set default values for existing users
UPDATE users
SET
    shop_name = COALESCE(shop_name, name),
    shop_owner_name = COALESCE(shop_owner_name, name),
    shop_mobile = COALESCE(shop_mobile, mobile),
    shop_email = COALESCE(shop_email, email)
WHERE shop_name IS NULL OR shop_owner_name IS NULL OR shop_mobile IS NULL OR shop_email IS NULL;
