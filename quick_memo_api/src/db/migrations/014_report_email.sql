-- Migration: Add customer_email to shop_reports
ALTER TABLE shop_reports
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
