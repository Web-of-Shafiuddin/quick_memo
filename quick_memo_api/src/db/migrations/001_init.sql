-- #####################################################################
-- #                  E-COMMERCE SAAS PLATFORM SCHEMA                #
-- # ----------------------------------------------------------------- #
-- # A complete, multi-tenant database schema for businesses to        #
-- # manage products, customers, and orders from various channels.     #
-- #####################################################################

-- ======================================================================
-- == IMPORTANT SETUP STEP                                              ==
-- ======================================================================
-- This SQL file creates the tables inside a specific database.
-- You must create the database itself first.
-- Connect to your PostgreSQL server using `psql` or another client
-- and run the following command BEFORE running this file:
--
--    CREATE DATABASE quick_memo;
--
-- After creating the database, you can run this file against it:
--    \c quick_memo
--    \i schema.sql
-- ======================================================================

-- ----------------------------------------------------------------------
-- 1. HELPER FUNCTION FOR UPDATED_AT TIMESTAMPS
-- ----------------------------------------------------------------------
-- This function will be called by triggers to automatically set the
-- updated_at column to the current time whenever a row is updated.
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$ BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
 $$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------
-- 2. USER, ADMIN, AND SUBSCRIPTION CONTEXT
-- ----------------------------------------------------------------------
-- Basic User table (Represents Shop Owners/Business Accounts using the platform)
CREATE TABLE IF NOT EXISTS users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20),
    password TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for the users table to automatically handle updated_at
CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Separate Admin table for system administration and platform management
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for the admins table
CREATE TRIGGER set_admins_timestamp
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table defining the available subscription tiers and their limitations (SaaS plans)
CREATE TABLE IF NOT EXISTS subscription_plans (
    plan_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'Free', 'Basic', 'Premium'
    monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    -- Defines access limitations for this plan:
    max_categories INT NOT NULL,
    max_products INT NOT NULL,
    max_orders_per_month INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for the subscription_plans table
CREATE TRIGGER set_subscription_plans_timestamp
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table tracking which users are subscribed to which plan
CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT UNIQUE NOT NULL, -- One active subscription record per user
    plan_id INT NOT NULL,
    start_date TIMESTAMP(3) NOT NULL,
    end_date TIMESTAMP(3) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'ACTIVE', 'CANCELED', 'EXPIRED'
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create trigger for the subscriptions table
CREATE TRIGGER set_subscriptions_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------------------------
-- 3. CUSTOMER MANAGEMENT
-- ----------------------------------------------------------------------
-- Table for tracking the business's customers (the people/entities purchasing products)
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL, -- CRITICAL: Links the customer to a specific business
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    mobile VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email, user_id), -- A business can't have two customers with the same email
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create trigger for the customers table
CREATE TRIGGER set_customers_timestamp
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------------------------
-- 4. PRODUCT MANAGEMENT (Categories and Products with Variants)
-- ----------------------------------------------------------------------
-- Categories belong to a specific User.
CREATE TABLE IF NOT EXISTS categories (
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INT NOT NULL, -- Links category ownership to a User
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create trigger for the categories table
CREATE TRIGGER set_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table for tangible, inventory-managed items.
CREATE TABLE IF NOT EXISTS products (
    product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL, -- CRITICAL: Links the product to a specific business
    sku VARCHAR(100) NOT NULL, 
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL, 
    discount REAL NOT NULL DEFAULT 0.00,
    stock INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    image TEXT,
    parent_product_id INT, -- For variant support. NULL if it's a base product.
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parent_product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (sku, user_id)
);

-- Create trigger for the products table
CREATE TRIGGER set_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table for storing variant attributes like 'Size: Medium' or 'Color: Blue'
CREATE TABLE IF NOT EXISTS product_variant_attributes (
    attribute_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id INT NOT NULL, -- This links to the VARIANT product_id
    attribute_name VARCHAR(50) NOT NULL, -- e.g., 'Size', 'Color'
    attribute_value VARCHAR(50) NOT NULL, -- e.g., 'Medium', 'Blue'
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------
-- 5. PAYMENT METHOD LOOKUP TABLE AND TRANSACTIONS
-- ----------------------------------------------------------------------
-- Lookup table for payment types (CASH, CARD, etc.)
CREATE TABLE IF NOT EXISTS payment_methods (
    payment_method_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'CASH', 'CARD', 'UPI', 'ONLINE TRANSFER'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for the payment_methods table
CREATE TRIGGER set_payment_methods_timestamp
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table for tracking financial transactions/payments between a User and an Admin (e.g., subscription fees)
CREATE TABLE IF NOT EXISTS payment_transactions (
    transaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'PENDING', 'COMPLETED', 'FAILED'
    order_reference TEXT, -- Optional: Can link to a specific order/invoice for context
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create trigger for the payment_transactions table
CREATE TRIGGER set_payment_transactions_timestamp
BEFORE UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS payment_transactions_user_admin_idx ON payment_transactions(user_id, admin_id);

-- ----------------------------------------------------------------------
-- 6. ORDER MANAGEMENT (Headers and Items)
-- ----------------------------------------------------------------------
-- Table for order headers (one row per order/transaction)
CREATE TABLE IF NOT EXISTS order_headers (
    transaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Unique ID for the entire order
    user_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_source VARCHAR(50) NOT NULL DEFAULT 'OFFLINE', -- 'FACEBOOK', 'INSTAGRAM', 'WEBSITE', etc.
    order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED'
    payment_method_id INT NOT NULL,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Per-order shipping
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Per-order tax
    total_amount NUMERIC(10, 2) NOT NULL, -- Total for the entire order
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create trigger for the order_headers table
CREATE TRIGGER set_order_headers_timestamp
BEFORE UPDATE ON order_headers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table for order line items (multiple rows per order)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id INT NOT NULL, -- Foreign key to the order header
    product_id INT NOT NULL,
    name_snapshot VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    item_discount REAL NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10, 2) NOT NULL, -- (quantity * unit_price) - item_discount
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES order_headers(transaction_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create trigger for the order_items table
CREATE TRIGGER set_order_items_timestamp
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Indexes for the new order tables
CREATE INDEX IF NOT EXISTS order_headers_user_id_idx ON order_headers(user_id);
CREATE INDEX IF NOT EXISTS order_headers_customer_id_idx ON order_headers(customer_id);
CREATE INDEX IF NOT EXISTS order_headers_date_idx ON order_headers(order_date);
CREATE INDEX IF NOT EXISTS order_items_transaction_id_idx ON order_items(transaction_id);

-- ----------------------------------------------------------------------
-- 7. INVOICE MANAGEMENT
-- ----------------------------------------------------------------------
-- A dedicated table for invoices, separating them from raw order data.
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'INV-2023-001'
    transaction_id INT NOT NULL, -- Now correctly references a unique column
    user_id INT NOT NULL,
    customer_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DUE', -- e.g., 'DUE', 'PAID', 'OVERDUE', 'VOID'
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- CORRECTED: Now references the unique primary key of order_headers
    FOREIGN KEY (transaction_id) REFERENCES order_headers(transaction_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create trigger for the invoices table
CREATE TRIGGER set_invoices_timestamp
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS invoices_transaction_id_idx ON invoices(transaction_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);