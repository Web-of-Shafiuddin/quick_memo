import { Request, Response } from "express";
import pool from "../config/database.js";

// ==================== USER ENDPOINTS ====================

// Get all subscription plans
export const getPlans = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT plan_id, name, monthly_price, max_categories, max_products, max_orders_per_month FROM subscription_plans WHERE is_active = true ORDER BY monthly_price ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ success: false, error: "Failed to fetch plans" });
  }
};

// Get user's current subscription
export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT s.*, sp.name as plan_name, sp.monthly_price, sp.max_categories, sp.max_products, sp.max_orders_per_month
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.plan_id
       WHERE s.user_id = $1 AND s.status = 'ACTIVE'`,
      [userId]
    );

    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    res.status(500).json({ success: false, error: "Failed to fetch subscription" });
  }
};

// Get user's subscription requests
export const getUserRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT sr.*, sp.name as plan_name, sp.monthly_price
       FROM subscription_requests sr
       JOIN subscription_plans sp ON sr.plan_id = sp.plan_id
       WHERE sr.user_id = $1
       ORDER BY sr.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({ success: false, error: "Failed to fetch requests" });
  }
};

// Submit a subscription payment request
export const submitRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { plan_id, payment_method, transaction_id, amount, phone_number } = req.body;

    // Check if plan exists and is active
    const planResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE plan_id = $1 AND is_active = true',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid or inactive plan" });
    }

    // Check if user has a pending request
    const pendingResult = await pool.query(
      "SELECT * FROM subscription_requests WHERE user_id = $1 AND status = 'PENDING'",
      [userId]
    );

    if (pendingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "You already have a pending subscription request. Please wait for admin review."
      });
    }

    // Create the subscription request
    const result = await pool.query(
      `INSERT INTO subscription_requests (user_id, plan_id, payment_method, transaction_id, amount, phone_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [userId, plan_id, payment_method, transaction_id, amount, phone_number]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ success: false, error: "Failed to submit request" });
  }
};

// ==================== ADMIN ENDPOINTS ====================

// Get all subscription requests (admin)
export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT sr.*, sp.name as plan_name, sp.monthly_price, u.name as user_name, u.email as user_email,
             a.name as reviewed_by_name
      FROM subscription_requests sr
      JOIN subscription_plans sp ON sr.plan_id = sp.plan_id
      JOIN users u ON sr.user_id = u.user_id
      LEFT JOIN admins a ON sr.reviewed_by = a.admin_id
    `;

    const params: any[] = [];
    if (status) {
      query += ' WHERE sr.status = $1';
      params.push(status);
    }

    query += ' ORDER BY sr.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching all requests:", error);
    res.status(500).json({ success: false, error: "Failed to fetch requests" });
  }
};

// Approve subscription request (admin)
export const approveRequest = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const adminId = req.adminId;
    const { duration_months = 1 } = req.body; // Default 1 month

    await client.query('BEGIN');

    // Get the request
    const requestResult = await client.query(
      'SELECT * FROM subscription_requests WHERE request_id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'PENDING') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: "Request already processed" });
    }

    // Update the request status
    await client.query(
      `UPDATE subscription_requests
       SET status = 'APPROVED', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, admin_notes = $2
       WHERE request_id = $3`,
      [adminId, req.body.admin_notes || 'Approved', id]
    );

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration_months);

    // Check if user already has a subscription
    const existingSubResult = await client.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [request.user_id]
    );

    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      await client.query(
        `UPDATE subscriptions
         SET plan_id = $1, start_date = $2, end_date = $3, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4`,
        [request.plan_id, startDate, endDate, request.user_id]
      );
    } else {
      // Create new subscription
      await client.query(
        `INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')`,
        [request.user_id, request.plan_id, startDate, endDate]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, message: "Request approved and subscription activated" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error approving request:", error);
    res.status(500).json({ success: false, error: "Failed to approve request" });
  } finally {
    client.release();
  }
};

// Reject subscription request (admin)
export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.adminId;
    const { admin_notes } = req.body;

    if (!admin_notes) {
      return res.status(400).json({ success: false, error: "Rejection reason is required" });
    }

    // Get the request
    const requestResult = await pool.query(
      'SELECT * FROM subscription_requests WHERE request_id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    if (requestResult.rows[0].status !== 'PENDING') {
      return res.status(400).json({ success: false, error: "Request already processed" });
    }

    // Update the request status
    await pool.query(
      `UPDATE subscription_requests
       SET status = 'REJECTED', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, admin_notes = $2
       WHERE request_id = $3`,
      [adminId, admin_notes, id]
    );

    res.json({ success: true, message: "Request rejected" });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ success: false, error: "Failed to reject request" });
  }
};

// Get subscription stats (admin)
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM subscription_requests WHERE status = 'PENDING') as pending_requests,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'ACTIVE') as active_subscriptions,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COALESCE(SUM(amount), 0) FROM subscription_requests WHERE status = 'APPROVED') as total_revenue
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
};
