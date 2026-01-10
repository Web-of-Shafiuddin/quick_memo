import { Request, Response } from "express";
import pool from "../config/database.js";

// Get shop profile by slug
export const getShopBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT user_id, name, shop_name, shop_owner_name, shop_mobile, shop_email, shop_address, shop_logo_url, shop_description, social_links, is_verified, has_badge, is_active,
              (SELECT COALESCE(AVG(rating), 0) FROM shop_reviews WHERE shop_id = users.user_id AND product_id IS NULL) as average_rating,
              (SELECT COUNT(*) FROM shop_reviews WHERE shop_id = users.user_id AND product_id IS NULL) as review_count
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
export const getShopProducts = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { category_id, search, sort, page = 1, limit = 12 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const offset = (pageNum - 1) * limitNum;

    // First get user_id from slug
    const user = await pool.query(
      "SELECT user_id FROM users WHERE shop_slug = $1",
      [slug]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }
    const userId = user.rows[0].user_id;

    let baseQuery = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.user_id = $1 AND p.parent_product_id IS NULL AND p.status = 'ACTIVE'
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (category_id) {
      baseQuery += ` AND p.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (search) {
      baseQuery += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Count query
    const countResult = await pool.query(
      `SELECT COUNT(*) ${baseQuery}`,
      params
    );
    const totalProducts = parseInt(countResult.rows[0].count);

    // Data query
    let query = `
      SELECT p.*, c.name as category_name,
             (SELECT COUNT(*) FROM products v WHERE v.parent_product_id = p.product_id) as variant_count,
             (SELECT COALESCE(AVG(rating), 0) FROM shop_reviews sr WHERE sr.product_id = p.product_id) as average_rating,
             (SELECT COUNT(*) FROM shop_reviews sr WHERE sr.product_id = p.product_id) as review_count
      ${baseQuery}
    `;

    if (sort === "price_asc") {
      query += " ORDER BY p.price ASC";
    } else if (sort === "price_desc") {
      query += " ORDER BY p.price DESC";
    } else {
      query += " ORDER BY p.created_at DESC";
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalProducts,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalProducts / limitNum),
      },
    });
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
      `SELECT p.*, c.name as category_name,
              (SELECT COALESCE(AVG(rating), 0) FROM shop_reviews sr WHERE sr.product_id = p.product_id) as average_rating,
              (SELECT COUNT(*) FROM shop_reviews sr WHERE sr.product_id = p.product_id) as review_count
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
      "SELECT * FROM products WHERE parent_product_id = $1 AND status = 'ACTIVE'",
      [product.product_id]
    );

    // Get attributes (global for this product)
    const attributesResult = await pool.query(
      "SELECT * FROM product_variant_attributes WHERE product_id = $1",
      [product.product_id]
    );

    // Get gallery images
    const galleryResult = await pool.query(
      "SELECT * FROM product_gallery_images WHERE product_id = $1",
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

    // Get product reviews
    const reviewsResult = await pool.query(
      "SELECT * FROM shop_reviews WHERE product_id = $1 ORDER BY created_at DESC",
      [product.product_id]
    );

    res.json({
      success: true,
      data: {
        ...product,
        attributes: attributesResult.rows,
        variants: variantsWithAttributes,
        gallery_images: galleryResult.rows,
        reviews: reviewsResult.rows,
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
    const { customer_name, customer_email, customer_mobile, customer_address, items } =
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
        "INSERT INTO customers (user_id, name, email, mobile, address) VALUES ($1, $2, $3, $4, $5) RETURNING customer_id",
        [userId, customer_name, customer_email, customer_mobile, customer_address]
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

// Report a shop
export const reportShop = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { customer_name, customer_mobile, customer_email, reason } = req.body;

    const user = await pool.query(
      "SELECT user_id FROM users WHERE shop_slug = $1",
      [slug]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }
    const shopId = user.rows[0].user_id;

    await pool.query(
      "INSERT INTO shop_reports (shop_id, customer_name, customer_mobile, customer_email, reason) VALUES ($1, $2, $3, $4, $5)",
      [shopId, customer_name, customer_mobile, customer_email, reason]
    );

    // Automation: If shop gets 3 or more reports, investigate - for now let's just count
    const reportsCount = await pool.query(
      "SELECT COUNT(*) FROM shop_reports WHERE shop_id = $1",
      [shopId]
    );
    if (parseInt(reportsCount.rows[0].count) >= 3) {
      // Auto-suspend or flag? User mentioned: "automatically pause their shop link until you investigate"
      await pool.query(
        "UPDATE users SET is_active = FALSE WHERE user_id = $1",
        [shopId]
      );
    }

    res
      .status(201)
      .json({ success: true, message: "Report submitted successfully" });
  } catch (error) {
    console.error("Error reporting shop:", error);
    res.status(500).json({ success: false, error: "Failed to report shop" });
  }
};

// Submit a review (Shop or Product)
export const submitReview = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { transaction_id, product_id, rating, comment } = req.body;

    // Verify order is DELIVERED
    const orderCheck = await pool.query(
      "SELECT order_status, user_id FROM order_headers WHERE transaction_id = $1",
      [transaction_id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (orderCheck.rows[0].order_status !== "DELIVERED") {
      return res.status(400).json({
        success: false,
        error: "Reviews are only allowed for delivered orders",
      });
    }

    const shopId = orderCheck.rows[0].user_id;

    // If product_id is provided, verify it belongs to this order
    if (product_id) {
      const itemCheck = await pool.query(
        "SELECT order_item_id FROM order_items WHERE transaction_id = $1 AND product_id = $2",
        [transaction_id, product_id]
      );
      if (itemCheck.rows.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "Product not found in this order" });
      }
    }

    await pool.query(
      "INSERT INTO shop_reviews (shop_id, transaction_id, product_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
      [shopId, transaction_id, product_id || null, rating, comment]
    );

    res
      .status(201)
      .json({ success: true, message: "Review submitted successfully" });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "You have already reviewed this item/shop for this order",
      });
    }
    res.status(500).json({ success: false, error: "Failed to submit review" });
  }
};

// Get reviews (Shop level if product_id is null)
export const getShopReviews = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { product_id } = req.query;

    const user = await pool.query(
      "SELECT user_id FROM users WHERE shop_slug = $1",
      [slug]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }
    const shopId = user.rows[0].user_id;

    let query = `
      SELECT r.*, oh.order_date, c.name as customer_name
      FROM shop_reviews r
      JOIN order_headers oh ON r.transaction_id = oh.transaction_id
      JOIN customers c ON oh.customer_id = c.customer_id
      WHERE r.shop_id = $1
    `;
    const params = [shopId];

    if (product_id) {
      query += " AND r.product_id = $2";
      params.push(product_id as any);
    } else {
      query += " AND r.product_id IS NULL";
    }

    query += " ORDER BY r.created_at DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
};
