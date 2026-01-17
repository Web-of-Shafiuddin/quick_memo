# Quick Memo Documentation

This document provides a comprehensive overview of the Quick Memo application, including its features, use cases, and API reference.

## 1. Introduction

Quick Memo is a powerful, all-in-one sales management platform designed for online sellers and small businesses. It simplifies the process of managing orders, customers, and products, while also providing a professional online storefront to help you grow your business.

## 2. Features

Quick Memo offers a wide range of features to help you streamline your sales process and grow your business.

### 2.1. Public Shop & Live Store

Create a professional online storefront to showcase your products and accept orders directly from your customers.

- **Professional Storefront:** Build a beautiful, mobile-friendly online store with your own branding.
- **Easy Product Management:** Add, edit, and organize your products with images, descriptions, and pricing.
- **Direct Orders:** Customers can browse your products and place orders directly from your live store.
- **Social Media Integration:** Share your shop link on Facebook, Instagram, and other social media platforms to drive traffic and sales.

### 2.2. Order Management

Manage all your orders from a single, centralized dashboard.

- **Centralized Dashboard:** Track orders from your public shop, social media, and other channels in one place.
- **Order Status Tracking:** Keep track of the status of each order, from pending to delivered.
- **Payment Tracking:** Record and manage payments for each order.
- **Invoices & Memos:** Generate professional invoices and cash memos to send to your customers.

### 2.3. Customer Management

Build and manage your customer database to foster long-term relationships and encourage repeat business.

- **Customer Database:** Store and manage all your customer information in one place.
- **Purchase History:** Track the purchase history of each customer to understand their preferences and buying habits.
- **Contact Information:** Keep track of your customers' contact information for easy communication.
- **Loyalty & Retention:** Use customer data to send targeted promotions and offers to encourage repeat business.

### 2.4. Product Catalog

Organize your products with a professional and easy-to-use product catalog.

- **Product Organization:** Organize your products with images, variants, prices, and stock levels.
- **Quick Search & Selection:** Quickly search and select products when creating orders.
- **Inventory Management:** Automatically update your inventory levels as you sell products.

### 2.5. Analytics & Reporting

Gain valuable insights into your sales performance with our powerful analytics and reporting tools.

- **Sales Dashboard:** Get a real-time overview of your sales, orders, and revenue.
- **Sales Reports:** Generate detailed sales reports to track your performance over time.
- **Product Performance:** Identify your best-selling products and optimize your product offerings.
- **Customer Insights:** Understand your customers' behavior and preferences to better serve their needs.

## 3. Use Cases

Quick Memo is a versatile platform that can be used by a wide range of online sellers and small businesses.

- **F-Commerce Sellers:** Manage orders from Facebook, Instagram, and other social media platforms.
- **E-commerce Businesses:** Create a professional online store and manage your sales from a single platform.
- **Small Businesses:** Streamline your sales process and manage your customer relationships.
- **Entrepreneurs:** Start and grow your online business with our all-in-one sales management platform.

## 4. API Reference

The Quick Memo API is a RESTful API that allows you to interact with the Quick Memo platform programmatically.

### 4.1. Authentication

The API uses JSON Web Tokens (JWT) for authentication. To authenticate with the API, you need to obtain a JWT by sending a POST request to the `/api/auth/login` or `/api/auth/register` endpoint.

**Login**

- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a user and returns a JWT.
- **Request Body:**
  - `email` (string, required): The user's email address.
  - `password` (string, required): The user's password.
- **Response:**
  - `token` (string): The JWT.

**Register**

- **Endpoint:** `POST /api/auth/register`
- **Description:** Creates a new user and returns a JWT.
- **Request Body:**
  - `email` (string, required): The user's email address.
  - `password` (string, required): The user's password.
  - `name` (string, optional): The user's name.
- **Response:**
  - `token` (string): The JWT.

### 4.2. Orders

The Orders API allows you to manage orders in your Quick Memo account.

**Get All Orders**

- **Endpoint:** `GET /api/orders`
- **Description:** Retrieves a list of all orders.
- **Response:** An array of order objects.

**Get Order by ID**

- **Endpoint:** `GET /api/orders/:id`
- **Description:** Retrieves a specific order by its ID.
- **Response:** An order object.

**Create Order**

- **Endpoint:** `POST /api/orders`
- **Description:** Creates a new order.
- **Request Body:**
  - `customer_id` (string, required): The ID of the customer placing the order.
  - `products` (array, required): An array of product objects, each with a `product_id` and `quantity`.
  - `total_amount` (number, required): The total amount of the order.
- **Response:** The newly created order object.

**Update Order**

- **Endpoint:** `PUT /api/orders/:id`
- **Description:** Updates an existing order.
- **Request Body:**
  - `status` (string, optional): The new status of the order.
- **Response:** The updated order object.

**Cancel Order**

- **Endpoint:** `POST /api/orders/:id/cancel`
- **Description:** Cancels an existing order.
- **Response:** A confirmation message.

### 4.3. Products

The Products API allows you to manage the products in your Quick Memo account.

**Get All Products**

- **Endpoint:** `GET /api/products`
- **Description:** Retrieves a list of all products.
- **Response:** An array of product objects.

**Get Product by ID**

- **Endpoint:** `GET /api/products/:id`
- **Description:** Retrieves a specific product by its ID.
- **Response:** A product object.

**Create Product**

- **Endpoint:** `POST /api/products`
- **Description:** Creates a new product.
- **Request Body:**
  - `name` (string, required): The name of the product.
  - `price` (number, required): The price of the product.
  - `stock` (number, optional): The stock quantity of the product.
- **Response:** The newly created product object.

**Update Product**

- **Endpoint:** `PUT /api/products/:id`
- **Description:** Updates an existing product.
- **Request Body:**
  - `name` (string, optional): The new name of the product.
  - `price` (number, optional): The new price of the product.
  - `stock` (number, optional): The new stock quantity of the product.
- **Response:** The updated product object.
