import { Request, Response } from "express";
import pool from "../config/database.js";

// ==================== USER ENDPOINTS ====================

// Get all subscription plans (public - for pricing page)
export const getPlans = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT plan_id, name, description, monthly_price, half_yearly_price, yearly_price,
              max_categories, max_products, max_orders_per_month, max_customers, can_upload_images,
              features, badge_text, badge_color, is_popular, is_active
       FROM subscription_plans
       WHERE is_active = true
       ORDER BY display_order ASC, monthly_price ASC`
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
    const { plan_id, payment_method, transaction_id, amount, phone_number, duration_months = 1 } = req.body;

    // Check if plan exists and is active
    const planResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE plan_id = $1 AND is_active = true',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid or inactive plan" });
    }

    const plan = planResult.rows[0];

    // If it's a free plan, redirect to activateFreePlan
    if (plan.monthly_price === 0 || plan.monthly_price === '0' || parseFloat(plan.monthly_price) === 0) {
      return res.status(400).json({
        success: false,
        error: "Free plans don't require payment. Use the activate free plan option instead."
      });
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
      `INSERT INTO subscription_requests (user_id, plan_id, payment_method, transaction_id, amount, phone_number, duration_months, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING *`,
      [userId, plan_id, payment_method, transaction_id, amount, phone_number, duration_months]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ success: false, error: "Failed to submit request" });
  }
};

// Activate free plan (no payment required)
export const activateFreePlan = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Find the free plan
    const planResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE monthly_price = 0 AND is_active = true LIMIT 1'
    );

    if (planResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: "No free plan available" });
    }

    const freePlan = planResult.rows[0];

    // Check if user already has an active subscription
    const existingSubResult = await pool.query(
      "SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'ACTIVE'",
      [userId]
    );

    if (existingSubResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "You already have an active subscription"
      });
    }

    // Calculate subscription dates (free plan is perpetual, but we set a far future date)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100); // Effectively forever

    // Create the subscription directly (no payment verification needed)
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')
       ON CONFLICT (user_id)
       DO UPDATE SET plan_id = $2, start_date = $3, end_date = $4, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP`,
      [userId, freePlan.plan_id, startDate, endDate]
    );

    res.status(201).json({
      success: true,
      message: "Free plan activated successfully",
      data: {
        plan_name: freePlan.name,
        start_date: startDate,
        end_date: endDate
      }
    });
  } catch (error) {
    console.error("Error activating free plan:", error);
    res.status(500).json({ success: false, error: "Failed to activate free plan" });
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
    // Only filter by status if it's not 'ALL' and is provided
    if (status && status !== 'ALL') {
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

    // Use duration from request, or override from body if provided
    const duration_months = req.body.duration_months || request.duration_months || 1;

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
        (SELECT COUNT(*) FROM subscription_requests WHERE status = 'PENDING') as pending,
        (SELECT COUNT(*) FROM subscription_requests WHERE status = 'APPROVED') as approved,
        (SELECT COUNT(*) FROM subscription_requests WHERE status = 'REJECTED') as rejected,
        (SELECT COALESCE(SUM(amount), 0) FROM subscription_requests WHERE status = 'APPROVED') as total_revenue
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
};

// ==================== ADMIN PLAN MANAGEMENT ====================

// Get all plans including inactive (admin)
export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM subscription_plans ORDER BY display_order ASC, plan_id ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching all plans:", error);
    res.status(500).json({ success: false, error: "Failed to fetch plans" });
  }
};

// Get single plan (admin)
export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM subscription_plans WHERE plan_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ success: false, error: "Failed to fetch plan" });
  }
};

// Create new plan (admin)
export const createPlan = async (req: Request, res: Response) => {
  try {
    const {
      name, description, monthly_price, half_yearly_price, yearly_price,
      max_categories, max_products, max_orders_per_month, max_customers, can_upload_images,
      features, badge_text, badge_color, display_order, is_popular, is_active
    } = req.body;

    if (!name || monthly_price === undefined) {
      return res.status(400).json({ success: false, error: "Name and monthly price are required" });
    }

    // Free plans cannot upload images by default
    const canUpload = monthly_price > 0 ? (can_upload_images !== false) : false;

    const result = await pool.query(
      `INSERT INTO subscription_plans
       (name, description, monthly_price, half_yearly_price, yearly_price,
        max_categories, max_products, max_orders_per_month, max_customers, can_upload_images,
        features, badge_text, badge_color, display_order, is_popular, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        name, description || null, monthly_price, half_yearly_price || null, yearly_price || null,
        max_categories || -1, max_products || -1, max_orders_per_month || -1, max_customers || -1, canUpload,
        features ? JSON.stringify(features) : '[]', badge_text || null, badge_color || null, display_order || 0, is_popular || false, is_active !== false
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating plan:", error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: "A plan with this name already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to create plan" });
  }
};

// Update plan (admin)
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name, description, monthly_price, half_yearly_price, yearly_price,
      max_categories, max_products, max_orders_per_month, max_customers, can_upload_images,
      features, badge_text, badge_color, display_order, is_popular, is_active
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
    if (monthly_price !== undefined) { updates.push(`monthly_price = $${paramIndex++}`); values.push(monthly_price); }
    if (half_yearly_price !== undefined) { updates.push(`half_yearly_price = $${paramIndex++}`); values.push(half_yearly_price); }
    if (yearly_price !== undefined) { updates.push(`yearly_price = $${paramIndex++}`); values.push(yearly_price); }
    if (max_categories !== undefined) { updates.push(`max_categories = $${paramIndex++}`); values.push(max_categories); }
    if (max_products !== undefined) { updates.push(`max_products = $${paramIndex++}`); values.push(max_products); }
    if (max_orders_per_month !== undefined) { updates.push(`max_orders_per_month = $${paramIndex++}`); values.push(max_orders_per_month); }
    if (max_customers !== undefined) { updates.push(`max_customers = $${paramIndex++}`); values.push(max_customers); }
    if (can_upload_images !== undefined) { updates.push(`can_upload_images = $${paramIndex++}`); values.push(can_upload_images); }
    if (features !== undefined) { updates.push(`features = $${paramIndex++}`); values.push(JSON.stringify(features)); }
    if (badge_text !== undefined) { updates.push(`badge_text = $${paramIndex++}`); values.push(badge_text); }
    if (badge_color !== undefined) { updates.push(`badge_color = $${paramIndex++}`); values.push(badge_color); }
    if (display_order !== undefined) { updates.push(`display_order = $${paramIndex++}`); values.push(display_order); }
    if (is_popular !== undefined) { updates.push(`is_popular = $${paramIndex++}`); values.push(is_popular); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramIndex++}`); values.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE subscription_plans SET ${updates.join(", ")} WHERE plan_id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error updating plan:", error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: "A plan with this name already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to update plan" });
  }
};

// Delete plan (admin) - soft delete by setting is_active to false
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if any users are subscribed to this plan
    const subCheck = await pool.query(
      "SELECT COUNT(*) FROM subscriptions WHERE plan_id = $1 AND status = 'ACTIVE'",
      [id]
    );

    if (parseInt(subCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete plan with active subscriptions. Deactivate it instead."
      });
    }

    const result = await pool.query(
      'UPDATE subscription_plans SET is_active = false WHERE plan_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    res.json({ success: true, message: "Plan deactivated successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ success: false, error: "Failed to delete plan" });
  }
};
