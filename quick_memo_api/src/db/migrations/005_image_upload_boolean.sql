-- Migration: Change max_images_per_product to can_upload_images boolean
-- Free plan cannot upload images, paid plans can

-- Add new boolean column
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS can_upload_images BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing plans: paid plans can upload images, free cannot
UPDATE subscription_plans SET can_upload_images = FALSE WHERE name = 'Free' OR monthly_price = 0;
UPDATE subscription_plans SET can_upload_images = TRUE WHERE monthly_price > 0;

-- Drop the old column (optional - keeping for now in case rollback needed)
-- ALTER TABLE subscription_plans DROP COLUMN IF EXISTS max_images_per_product;
