-- #####################################################################
-- #                  E-COMMERCE SAAS PLATFORM SCHEMA                #
-- # ----------------------------------------------------------------- #
-- # A complete, multi-tenant database schema for businesses to        #
-- # manage products, customers, and orders from various channels.     #
-- #####################################################################

-- ----------------------------------------------------------------------
-- 1. USER, ADMIN, AND SUBSCRIPTION CONTEXT
-- ----------------------------------------------------------------------
-- (No changes in this section)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20),
    password TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
    admin_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_categories INTEGER NOT NULL,
    max_products INTEGER NOT NULL,
    max_orders_per_month INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    plan_id INTEGER NOT NULL,
    start_date TIMESTAMP(3) NOT NULL,
    end_date TIMESTAMP(3) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------
-- 2. CUSTOMER MANAGEMENT
-- ----------------------------------------------------------------------
-- (No changes in this section)
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    mobile VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    UNIQUE (email, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------
-- 3. PRODUCT MANAGEMENT (Categories and Products with Variants)
-- ----------------------------------------------------------------------
-- (No changes in this section)
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    UNIQUE (name, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    sku VARCHAR(100) NOT NULL, 
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL, 
    discount REAL NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    image TEXT,
    parent_product_id INTEGER,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parent_product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (sku, user_id)
);

CREATE TABLE IF NOT EXISTS product_variant_attributes (
    attribute_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    attribute_name VARCHAR(50) NOT NULL,
    attribute_value VARCHAR(50) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------
-- 4. PAYMENT METHOD LOOKUP TABLE AND TRANSACTIONS
-- ----------------------------------------------------------------------
-- (No changes in this section)
CREATE TABLE IF NOT EXISTS payment_methods (
    payment_method_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    order_reference TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS payment_transactions_user_admin_idx ON payment_transactions(user_id, admin_id);


-- ----------------------------------------------------------------------
-- 5. ORDER MANAGEMENT (CORRECTED: Headers and Items)
-- ----------------------------------------------------------------------

-- Table for order headers (one row per order/transaction)
CREATE TABLE IF NOT EXISTS order_headers (
    transaction_id SERIAL PRIMARY KEY, -- Unique ID for the entire order
    user_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    order_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_source VARCHAR(50) NOT NULL DEFAULT 'OFFLINE',
    order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method_id INTEGER NOT NULL,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL, -- Total for the entire order
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table for order line items (multiple rows per order)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL, -- Foreign key to the order header
    product_id INTEGER NOT NULL,
    name_snapshot VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    item_discount REAL NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES order_headers(transaction_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes for the new order tables
CREATE INDEX IF NOT EXISTS order_headers_user_id_idx ON order_headers(user_id);
CREATE INDEX IF NOT EXISTS order_headers_customer_id_idx ON order_headers(customer_id);
CREATE INDEX IF NOT EXISTS order_headers_date_idx ON order_headers(order_date);
CREATE INDEX IF NOT EXISTS order_items_transaction_id_idx ON order_items(transaction_id);


-- ----------------------------------------------------------------------
-- 6. INVOICE MANAGEMENT (CORRECTED)
-- ----------------------------------------------------------------------
-- A dedicated table for invoices, separating them from raw order data.
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    transaction_id INTEGER NOT NULL, -- Now correctly references a unique column
    user_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DUE',
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    -- CORRECTED: Now references the unique primary key of order_headers
    FOREIGN KEY (transaction_id) REFERENCES order_headers(transaction_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS invoices_transaction_id_idx ON invoices(transaction_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);


-- ----------------------------------------------------------------------
-- 7. FINAL TABLE MODIFICATIONS
-- ----------------------------------------------------------------------
-- NOTE: `updated_at` management is typically handled by the application layer or 
-- by advanced database triggers (not shown here for schema simplicity).