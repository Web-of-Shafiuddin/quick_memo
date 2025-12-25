import { Request, Response } from "express";
import pool from "../config/database.js";

// Get all users with their subscription status
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT u.user_id, u.name, u.email, u.mobile, u.shop_name, u.created_at, u.updated_at,
             s.status as subscription_status, sp.name as plan_name, s.end_date as subscription_end
      FROM users u
      LEFT JOIN subscriptions s ON u.user_id = s.user_id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.plan_id
    `;

    const params: any[] = [];
    if (search) {
      query += ` WHERE u.name ILIKE $1 OR u.email ILIKE $1 OR u.mobile ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users';
    const countParams: any[] = [];
    if (search) {
      countQuery += ` WHERE name ILIKE $1 OR email ILIKE $1 OR mobile ILIKE $1`;
      countParams.push(`%${search}%`);
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

// Get single user details with full information
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get user info
    const userResult = await pool.query(
      `SELECT user_id, name, email, mobile, shop_name, shop_owner_name, shop_mobile, shop_email, shop_address, created_at, updated_at
       FROM users WHERE user_id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = userResult.rows[0];

    // Get subscription info
    const subResult = await pool.query(
      `SELECT s.*, sp.name as plan_name, sp.monthly_price
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.plan_id
       WHERE s.user_id = $1`,
      [id]
    );

    // Get subscription requests history
    const requestsResult = await pool.query(
      `SELECT sr.*, sp.name as plan_name
       FROM subscription_requests sr
       JOIN subscription_plans sp ON sr.plan_id = sp.plan_id
       WHERE sr.user_id = $1
       ORDER BY sr.created_at DESC
       LIMIT 10`,
      [id]
    );

    // Get user stats
    const statsResult = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM products WHERE user_id = $1) as total_products,
         (SELECT COUNT(*) FROM customers WHERE user_id = $1) as total_customers,
         (SELECT COUNT(*) FROM order_headers WHERE user_id = $1) as total_orders,
         (SELECT COUNT(*) FROM categories WHERE user_id = $1) as total_categories`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...user,
        subscription: subResult.rows[0] || null,
        subscription_requests: requestsResult.rows,
        stats: statsResult.rows[0]
      }
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user details" });
  }
};

// Update user (admin can edit user details)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, shop_name, shop_owner_name, shop_mobile, shop_email, shop_address } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (mobile !== undefined) {
      updates.push(`mobile = $${paramIndex++}`);
      values.push(mobile);
    }
    if (shop_name !== undefined) {
      updates.push(`shop_name = $${paramIndex++}`);
      values.push(shop_name);
    }
    if (shop_owner_name !== undefined) {
      updates.push(`shop_owner_name = $${paramIndex++}`);
      values.push(shop_owner_name);
    }
    if (shop_mobile !== undefined) {
      updates.push(`shop_mobile = $${paramIndex++}`);
      values.push(shop_mobile);
    }
    if (shop_email !== undefined) {
      updates.push(`shop_email = $${paramIndex++}`);
      values.push(shop_email);
    }
    if (shop_address !== undefined) {
      updates.push(`shop_address = $${paramIndex++}`);
      values.push(shop_address);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "23505") {
      return res.status(409).json({ success: false, error: "Email already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to update user" });
  }
};

// Delete user (soft or hard delete based on your needs)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Delete user (cascades to related tables based on FK constraints)
    await pool.query('DELETE FROM users WHERE user_id = $1', [id]);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};

// Manually set user subscription (admin override)
export const setUserSubscription = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { plan_id, duration_months } = req.body;

    if (!plan_id || !duration_months) {
      return res.status(400).json({ success: false, error: "Plan ID and duration are required" });
    }

    await client.query('BEGIN');

    // Check if plan exists
    const planResult = await client.query(
      'SELECT * FROM subscription_plans WHERE plan_id = $1 AND is_active = true',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: "Invalid or inactive plan" });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration_months);

    // Check if user already has a subscription
    const existingSubResult = await client.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [id]
    );

    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      await client.query(
        `UPDATE subscriptions
         SET plan_id = $1, start_date = $2, end_date = $3, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4`,
        [plan_id, startDate, endDate, id]
      );
    } else {
      // Create new subscription
      await client.query(
        `INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')`,
        [id, plan_id, startDate, endDate]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, message: "Subscription updated successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error setting subscription:", error);
    res.status(500).json({ success: false, error: "Failed to set subscription" });
  } finally {
    client.release();
  }
};

// Cancel user subscription
export const cancelUserSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE subscriptions SET status = 'CANCELED', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Subscription not found" });
    }

    res.json({ success: true, message: "Subscription canceled" });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ success: false, error: "Failed to cancel subscription" });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'ACTIVE') as active_subscriptions,
        (SELECT COUNT(*) FROM subscription_requests WHERE status = 'PENDING') as pending_requests,
        (SELECT COUNT(*) FROM order_headers) as total_orders,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COALESCE(SUM(amount), 0) FROM subscription_requests WHERE status = 'APPROVED') as total_revenue
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
};
