-- Migration: Add subscription payment request system
-- Users submit payment requests, admins verify them

-- Table for tracking subscription payment requests
CREATE TABLE IF NOT EXISTS subscription_requests (
    request_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    payment_method VARCHAR(100) NOT NULL, -- e.g., 'bKash', 'Nagad', 'Rocket', 'Bank Transfer'
    transaction_id VARCHAR(255) NOT NULL, -- User's payment transaction ID
    amount NUMERIC(10, 2) NOT NULL,
    phone_number VARCHAR(20), -- Phone number used for payment (for mobile banking)
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    admin_notes TEXT, -- Notes from admin (reason for rejection, etc.)
    reviewed_by INT, -- Admin who reviewed the request
    reviewed_at TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES admins(admin_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create trigger for the subscription_requests table
CREATE TRIGGER set_subscription_requests_timestamp
BEFORE UPDATE ON subscription_requests
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscription_requests_user_id ON subscription_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON subscription_requests(status);

-- Insert default subscription plans if they don't exist
INSERT INTO subscription_plans (name, monthly_price, max_categories, max_products, max_orders_per_month, is_active)
VALUES
    ('Free', 0.00, 3, 10, 50, true),
    ('Basic', 99.00, 10, 100, 500, true),
    ('Premium', 199.00, 50, 1000, 5000, true),
    ('Enterprise', 499.00, -1, -1, -1, true) -- -1 means unlimited
ON CONFLICT (name) DO NOTHING;
