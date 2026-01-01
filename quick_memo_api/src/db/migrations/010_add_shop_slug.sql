-- Add shop_slug column to users table for unique public shop URLs
ALTER TABLE users
ADD COLUMN IF NOT EXISTS shop_slug VARCHAR(255) UNIQUE;

-- Create an index for faster lookups by slug
CREATE INDEX IF NOT EXISTS idx_users_shop_slug ON users(shop_slug);
