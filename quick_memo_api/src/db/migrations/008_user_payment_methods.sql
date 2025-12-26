-- Migration: Add user-specific payment methods
-- Each user can have their own payment methods with default system methods
-- Deleted payment methods are soft-deleted to preserve order history

-- Add user_id column to payment_methods table (NULL = system default, user_id = user custom)
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS user_id INT;

-- Add is_deleted column for soft delete (preserves order history)
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Add deleted_at timestamp for audit
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3);

-- Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_payment_methods_user'
    ) THEN
        ALTER TABLE payment_methods
        ADD CONSTRAINT fk_payment_methods_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Drop the unique constraint on name (since same name can exist for different users)
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_name_key;

-- Add a unique constraint on (name, user_id) for active payment methods only
-- Use partial unique indexes to handle NULL user_id (system defaults)
DROP INDEX IF EXISTS idx_payment_methods_name_user;
DROP INDEX IF EXISTS idx_payment_methods_name_system;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_methods_name_user
ON payment_methods (name, user_id) WHERE user_id IS NOT NULL AND is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_methods_name_system
ON payment_methods (name) WHERE user_id IS NULL AND is_deleted = FALSE;

-- Add index for faster user queries
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active, is_deleted);

-- Insert default system payment methods if they don't exist
-- Use a check to avoid duplicates since unique constraint has been modified
INSERT INTO payment_methods (name, is_active)
SELECT 'Cash', true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Cash' AND user_id IS NULL);

INSERT INTO payment_methods (name, is_active)
SELECT 'Card', true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Card' AND user_id IS NULL);

INSERT INTO payment_methods (name, is_active)
SELECT 'Online Payment', true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Online Payment' AND user_id IS NULL);

INSERT INTO payment_methods (name, is_active)
SELECT 'Bank Transfer', true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Bank Transfer' AND user_id IS NULL);
