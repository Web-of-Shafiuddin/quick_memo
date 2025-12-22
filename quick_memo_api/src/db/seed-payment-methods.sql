-- Seed payment methods for the application
-- Run this after running the migrations

INSERT INTO payment_methods (name, is_active) VALUES
('CASH', TRUE),
('CARD', TRUE),
('UPI', TRUE),
('ONLINE TRANSFER', TRUE),
('BANK TRANSFER', TRUE)
ON CONFLICT (name) DO NOTHING;
