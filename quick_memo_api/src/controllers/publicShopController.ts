import { Request, Response } from "express";
import pool from "../config/database.js";

// Get shop profile by slug
export const getShopBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT user_id, name, shop_name, shop_owner_name, shop_mobile, shop_email, shop_address, shop_logo_url
       FROM users
       WHERE shop_slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching shop by slug:", error);
    res.status(500).json({ success: false, error: "Failed to fetch shop" });
  }
};

// Get products for a shop by user ID (fetched via slug on frontend or passed directly if public API design differs)
// Better design: get products by slug directly to keep it public-friendly
export const getShopProducts = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { category_id, search, sort } = req.query;

    // First get user_id from slug
    const user = await pool.query(
      "SELECT user_id FROM users WHERE shop_slug = $1",
      [slug]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }
    const userId = user.rows[0].user_id;

    let query = `
      SELECT p.*, c.name as category_name,
             (SELECT COUNT(*) FROM products v WHERE v.parent_product_id = p.product_id) as variant_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.user_id = $1 AND p.parent_product_id IS NULL AND p.status = 'ACTIVE'
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (category_id) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (sort === "price_asc") {
      query += " ORDER BY p.price ASC";
    } else if (sort === "price_desc") {
      query += " ORDER BY p.price DESC";
    } else {
      query += " ORDER BY p.created_at DESC";
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching shop products:", error);
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
};

export const getShopProductBySku = async (req: Request, res: Response) => {
  try {
    const { slug, sku } = req.params;

    const user = await pool.query(
      "SELECT user_id FROM users WHERE shop_slug = $1",
      [slug]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }
    const userId = user.rows[0].user_id;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             WHERE p.sku = $1 AND p.user_id = $2`,
      [sku, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const product = result.rows[0];

    // Get variants
    const variantsResult = await pool.query(
      "SELECT * FROM products WHERE parent_product_id = $1",
      [product.product_id]
    );

    // Get attributes
    const attributesResult = await pool.query(
      "SELECT * FROM product_variant_attributes WHERE product_id = $1",
      [product.product_id]
    );

    // Get variant attributes
    const variantsWithAttributes = await Promise.all(
      variantsResult.rows.map(async (v) => {
        const vAttrs = await pool.query(
          "SELECT * FROM product_variant_attributes WHERE product_id = $1",
          [v.product_id]
        );
        return { ...v, attributes: vAttrs.rows };
      })
    );

    res.json({
      success: true,
      data: {
        ...product,
        attributes: attributesResult.rows,
        variants: variantsWithAttributes,
      },
    });
  } catch (error) {
    console.error("Error fetching shop product:", error);
    res.status(500).json({ success: false, error: "Failed to fetch product" });
  }
};
export const createPublicOrder = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { customer_name, customer_mobile, customer_address, items } =
      req.body;

    // 1. Get Shop Owner User ID
    const user = await pool.query(
      "SELECT user_id FROM users WHERE shop_slug = $1",
      [slug]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }
    const userId = user.rows[0].user_id;

    // 2. Find or Create Customer
    let customerId;
    const existingCustomer = await pool.query(
      "SELECT customer_id FROM customers WHERE user_id = $1 AND mobile = $2",
      [userId, customer_mobile]
    );

    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].customer_id;
    } else {
      const newCustomer = await pool.query(
        "INSERT INTO customers (user_id, name, mobile, address) VALUES ($1, $2, $3, $4) RETURNING customer_id",
        [userId, customer_name, customer_mobile, customer_address]
      );
      customerId = newCustomer.rows[0].customer_id;
    }

    // 3. Get Payment Method (Default to CASH)
    let paymentMethodId;
    const paymentMethodRes = await pool.query(
      "SELECT payment_method_id FROM payment_methods WHERE name ILIKE 'CASH' LIMIT 1"
    );
    if (paymentMethodRes.rows.length > 0) {
      paymentMethodId = paymentMethodRes.rows[0].payment_method_id;
    } else {
      const anyMethod = await pool.query(
        "SELECT payment_method_id FROM payment_methods LIMIT 1"
      );
      if (anyMethod.rows.length === 0) {
        throw new Error("No payment methods available");
      }
      paymentMethodId = anyMethod.rows[0].payment_method_id;
    }

    // 4. Create Order
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Calculate totals and prepare items
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const productRes = await client.query(
          "SELECT product_id, name, price, stock FROM products WHERE product_id = $1",
          [item.product_id]
        );

        if (productRes.rows.length === 0) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        const product = productRes.rows[0];
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name} (Available: ${product.stock})`
          );
        }

        const unitPrice = parseFloat(product.price);
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          product_id: item.product_id,
          name_snapshot: product.name,
          quantity: item.quantity,
          unit_price: unitPrice,
          subtotal: subtotal,
        });
      }

      // Insert Order Header
      const orderRes = await client.query(
        `INSERT INTO order_headers (
                  user_id, customer_id, total_amount, order_status, 
                  order_source, shipping_amount, tax_amount, payment_method_id
                ) VALUES ($1, $2, $3, 'PENDING', 'WEBSITE', 0, 0, $4) RETURNING transaction_id`,
        [userId, customerId, totalAmount, paymentMethodId]
      );
      const transactionId = orderRes.rows[0].transaction_id;

      // Insert Order Items and Update Stock
      for (const item of orderItemsData) {
        await client.query(
          `INSERT INTO order_items (
                       transaction_id, product_id, name_snapshot, quantity, unit_price, subtotal
                     ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            transactionId,
            item.product_id,
            item.name_snapshot,
            item.quantity,
            item.unit_price,
            item.subtotal,
          ]
        );

        await client.query(
          "UPDATE products SET stock = stock - $1 WHERE product_id = $2",
          [item.quantity, item.product_id]
        );
      }

      await client.query("COMMIT");
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        transaction_id: transactionId,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating public order:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
