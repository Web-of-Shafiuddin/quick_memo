-- ======================================================================
-- Migration: Add User Currency Preference
-- ======================================================================
-- Users can set their preferred currency for their business operations
-- (products, orders, invoices). Platform pricing remains in USD.

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD';

-- Create index for faster currency-based queries
CREATE INDEX IF NOT EXISTS users_preferred_currency_idx ON users(preferred_currency);
