-- Migration: Trust Ecosystem Enhancements
-- Adds verification, social links, reporting, and review system

-- 1. Add fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS nid_license_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shop_description TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_badge BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Create shop_reports table
CREATE TABLE IF NOT EXISTS shop_reports (
    report_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id INT NOT NULL, -- References users.user_id
    customer_name VARCHAR(255),
    customer_mobile VARCHAR(20),
    reason TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Create shop_reviews table
CREATE TABLE IF NOT EXISTS shop_reviews (
    review_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id INT NOT NULL, -- References users.user_id
    transaction_id INT NOT NULL, -- References order_headers
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES order_headers(transaction_id) ON DELETE CASCADE,
    UNIQUE(transaction_id) -- Only one review per order
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_shop_reports_shop_id ON shop_reports(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_reviews_shop_id ON shop_reviews(shop_id);
