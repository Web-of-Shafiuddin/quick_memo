-- Migration: Add payment records tracking for invoices
-- This enables tracking partial payments and full payment history for invoices

-- Add amount_paid column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
    payment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(100),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add index for faster invoice payment lookups
CREATE INDEX IF NOT EXISTS idx_payment_records_invoice_id ON payment_records(invoice_id);

-- Add index for payment date filtering
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date);

-- Create trigger to update timestamp on payment_records
CREATE TRIGGER set_payment_records_timestamp
BEFORE UPDATE ON payment_records
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add constraint to ensure payment amount is positive
ALTER TABLE payment_records ADD CONSTRAINT check_payment_amount_positive CHECK (amount_paid > 0);

-- Add constraint to ensure amount_paid in invoices doesn't exceed total_amount
ALTER TABLE invoices ADD CONSTRAINT check_invoice_amount_paid CHECK (amount_paid <= total_amount OR amount_paid = 0);
