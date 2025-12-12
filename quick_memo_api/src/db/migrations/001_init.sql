-- #####################################################################
-- #                  E-COMMERCE SAAS PLATFORM SCHEMA                #
-- # ----------------------------------------------------------------- #
-- # A complete, multi-tenant database schema for businesses to        #
-- # manage products, customers, and orders from various channels.     #
-- #####################################################################

-- ----------------------------------------------------------------------
-- 1. USER, ADMIN, AND SUBSCRIPTION CONTEXT
-- ----------------------------------------------------------------------

-- Basic User table (Represents Shop Owners/Business Accounts using the platform)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

-- Separate Admin table for system administration and platform management
CREATE TABLE IF NOT EXISTS admins (
    admin_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

-- Table defining the available subscription tiers and their limitations (SaaS plans)
CREATE TABLE IF NOT EXISTS subscription_plans (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'Free', 'Basic', 'Premium'
    monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    -- Defines access limitations for this plan:
    max_categories INTEGER NOT NULL,
    max_products INTEGER NOT NULL,
    max_orders_per_month INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

-- Table tracking which users are subscribed to which plan
CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL, -- One active subscription record per user
    plan_id INTEGER NOT NULL,
    start_date TIMESTAMP(3) NOT NULL,
    end_date TIMESTAMP(3) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'ACTIVE', 'CANCELED', 'EXPIRED'
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------
-- 2. CUSTOMER MANAGEMENT
-- ----------------------------------------------------------------------
-- Table for tracking the business's customers (the people/entities purchasing products)
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- CRITICAL: Links the customer to a specific business
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    mobile VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    UNIQUE (email, user_id), -- A business can't have two customers with the same email
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------
-- 3. PRODUCT MANAGEMENT (Categories and Products with Variants)
-- ----------------------------------------------------------------------
-- Categories belong to a specific User.
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL, -- Links category ownership to a User
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    UNIQUE (name, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table for tangible, inventory-managed items.
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- CRITICAL: Links the product to a specific business
    sku VARCHAR(100) NOT NULL, 
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL, 
    discount REAL NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    image TEXT,
    parent_product_id INTEGER, -- For variant support. NULL if it's a base product.
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parent_product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (sku, user_id)
);

-- Table for storing variant attributes like 'Size: Medium' or 'Color: Blue'
CREATE TABLE IF NOT EXISTS product_variant_attributes (
    attribute_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL, -- This links to the VARIANT product_id
    attribute_name VARCHAR(50) NOT NULL, -- e.g., 'Size', 'Color'
    attribute_value VARCHAR(50) NOT NULL, -- e.g., 'Medium', 'Blue'
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------
-- 4. PAYMENT METHOD LOOKUP TABLE AND TRANSACTIONS
-- ----------------------------------------------------------------------
-- Lookup table for payment types (CASH, CARD, etc.)
CREATE TABLE IF NOT EXISTS payment_methods (
    payment_method_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'CASH', 'CARD', 'UPI', 'ONLINE TRANSFER'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

-- Table for tracking financial transactions/payments between a User and an Admin (e.g., subscription fees)
CREATE TABLE IF NOT EXISTS payment_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'PENDING', 'COMPLETED', 'FAILED'
    order_reference TEXT, -- Optional: Can link to a specific order/invoice for context
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS payment_transactions_user_admin_idx ON payment_transactions(user_id, admin_id);

-- ----------------------------------------------------------------------
-- 5. ORDER MANAGEMENT (Improved and Multi-Tenant)
-- ----------------------------------------------------------------------
-- Denormalized table combining the transaction header and line item details.
-- Each row is a product line item, grouped by transaction_id.
CREATE TABLE IF NOT EXISTS orders (
    -- Unique identifier for the specific line item (the row's PK)
    order_item_id SERIAL PRIMARY KEY, 
    
    -- Identifier to group all line items belonging to one transaction/order
    transaction_id INTEGER NOT NULL, 
    
    -- Tenant & Transaction Header Data
    user_id INTEGER NOT NULL, -- CRITICAL: Links the order to a specific business
    customer_id INTEGER NOT NULL,
    order_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_source VARCHAR(50) NOT NULL DEFAULT 'OFFLINE', -- 'FACEBOOK', 'INSTAGRAM', 'WEBSITE', etc.
    order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED'
    
    -- Payment & Financials
    payment_method_id INTEGER NOT NULL,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Per-order shipping
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Per-order tax

    -- Line Item Data (Snapshot of the product at time of sale)
    product_id INTEGER NOT NULL, 
    name_snapshot VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    item_discount REAL NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10, 2) NOT NULL, -- (quantity * unit_price) - item_discount
    
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS orders_transaction_id_idx ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id); -- Essential for multi-tenant queries
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_date_idx ON orders(order_date); -- Essential for time-based reports

-- ----------------------------------------------------------------------
-- 6. INVOICE MANAGEMENT
-- ----------------------------------------------------------------------
-- A dedicated table for invoices, separating them from raw order data.
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'INV-2023-001'
    transaction_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DUE', -- e.g., 'DUE', 'PAID', 'OVERDUE', 'VOID'
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES orders(transaction_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS invoices_transaction_id_idx ON invoices(transaction_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);


-- ----------------------------------------------------------------------
-- 7. FINAL TABLE MODIFICATIONS (Cleanup for deployment)
-- ----------------------------------------------------------------------
-- NOTE: `updated_at` management is typically handled by the application layer or 
-- by advanced database triggers (not shown here for schema simplicity).
