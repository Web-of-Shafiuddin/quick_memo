-- Migration: Extend subscription_plans with pricing tiers, features, and descriptions

-- Add new columns to subscription_plans
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS half_yearly_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS yearly_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS max_customers INT NOT NULL DEFAULT -1,
ADD COLUMN IF NOT EXISTS max_images_per_product INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS badge_text VARCHAR(50),
ADD COLUMN IF NOT EXISTS badge_color VARCHAR(20),
ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN NOT NULL DEFAULT FALSE;

-- Add duration_months to subscription_requests to track which billing cycle user chose
ALTER TABLE subscription_requests
ADD COLUMN IF NOT EXISTS duration_months INT NOT NULL DEFAULT 1;

-- Update existing plans with extended information
UPDATE subscription_plans SET
    description = 'Perfect for trying out EzyMemo',
    half_yearly_price = 0.00,
    yearly_price = 0.00,
    max_customers = 10,
    max_images_per_product = 1,
    features = '["Basic order management", "Up to 10 products", "Up to 50 orders/month", "Email support"]'::jsonb,
    display_order = 1
WHERE name = 'Free';

UPDATE subscription_plans SET
    description = 'Great for small businesses just getting started',
    half_yearly_price = 499.00,
    yearly_price = 899.00,
    max_customers = 100,
    max_images_per_product = 3,
    features = '["Up to 100 products", "Up to 500 orders/month", "100 customers", "Priority email support", "Order memo printing", "Export reports"]'::jsonb,
    badge_text = 'Starter',
    badge_color = 'blue',
    display_order = 2
WHERE name = 'Basic';

UPDATE subscription_plans SET
    description = 'Best for growing businesses with more needs',
    half_yearly_price = 999.00,
    yearly_price = 1799.00,
    max_customers = 1000,
    max_images_per_product = 5,
    features = '["Up to 1000 products", "Up to 5000 orders/month", "1000 customers", "5 images per product", "Priority support", "Advanced analytics", "Custom branding"]'::jsonb,
    badge_text = 'Popular',
    badge_color = 'green',
    is_popular = true,
    display_order = 3
WHERE name = 'Premium';

UPDATE subscription_plans SET
    description = 'For large businesses with unlimited needs',
    half_yearly_price = 2499.00,
    yearly_price = 4499.00,
    max_customers = -1,
    max_images_per_product = -1,
    features = '["Unlimited products", "Unlimited orders", "Unlimited customers", "Unlimited images", "Dedicated support", "API access", "Custom integrations", "White-label options"]'::jsonb,
    badge_text = 'Enterprise',
    badge_color = 'purple',
    display_order = 4
WHERE name = 'Enterprise';
