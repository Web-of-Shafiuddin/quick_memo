import { Request, Response } from "express";
import pool from "../config/database.js";

// Get all payment methods for a user (includes system defaults + user custom)
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Get system defaults (user_id IS NULL) + user's custom methods
    const result = await pool.query(
      `SELECT payment_method_id, name, is_active, user_id,
              CASE WHEN user_id IS NULL THEN true ELSE false END as is_system_default,
              created_at, updated_at
       FROM payment_methods
       WHERE (user_id IS NULL OR user_id = $1)
         AND is_deleted = FALSE
       ORDER BY
         CASE WHEN user_id IS NULL THEN 0 ELSE 1 END,
         payment_method_id`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payment methods" });
  }
};

// Get active payment methods only (for dropdowns)
export const getActivePaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT payment_method_id, name,
              CASE WHEN user_id IS NULL THEN true ELSE false END as is_system_default
       FROM payment_methods
       WHERE (user_id IS NULL OR user_id = $1)
         AND is_active = TRUE
         AND is_deleted = FALSE
       ORDER BY
         CASE WHEN user_id IS NULL THEN 0 ELSE 1 END,
         payment_method_id`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching active payment methods:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payment methods" });
  }
};

// Create a new custom payment method for user
export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, error: "Payment method name is required" });
    }

    // Check if name already exists for this user or as system default
    const existing = await pool.query(
      `SELECT payment_method_id FROM payment_methods
       WHERE name = $1
         AND (user_id IS NULL OR user_id = $2)
         AND is_deleted = FALSE`,
      [name.trim(), userId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "A payment method with this name already exists",
      });
    }

    const result = await pool.query(
      `INSERT INTO payment_methods (name, user_id, is_active)
       VALUES ($1, $2, TRUE)
       RETURNING payment_method_id, name, is_active, user_id, created_at, updated_at`,
      [name.trim(), userId]
    );

    res.status(201).json({
      success: true,
      data: {
        ...result.rows[0],
        is_system_default: false,
      },
    });
  } catch (error: any) {
    console.error("Error creating payment method:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "A payment method with this name already exists",
      });
    }
    res.status(500).json({ success: false, error: "Failed to create payment method" });
  }
};

// Update a payment method (only user's own, not system defaults)
export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, is_active } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if this is user's own payment method (not system default)
    const existing = await pool.query(
      `SELECT payment_method_id, user_id FROM payment_methods
       WHERE payment_method_id = $1 AND is_deleted = FALSE`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Payment method not found" });
    }

    if (existing.rows[0].user_id === null) {
      return res.status(403).json({
        success: false,
        error: "Cannot modify system default payment methods",
      });
    }

    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Check for duplicate name if name is being changed
    if (name) {
      const duplicate = await pool.query(
        `SELECT payment_method_id FROM payment_methods
         WHERE name = $1
           AND payment_method_id != $2
           AND (user_id IS NULL OR user_id = $3)
           AND is_deleted = FALSE`,
        [name.trim(), id, userId]
      );

      if (duplicate.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: "A payment method with this name already exists",
        });
      }
    }

    const updates: string[] = [];
    const values: (string | boolean | number)[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name.trim());
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE payment_methods
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE payment_method_id = $${paramCount}
       RETURNING payment_method_id, name, is_active, user_id, created_at, updated_at`,
      values
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        is_system_default: false,
      },
    });
  } catch (error: any) {
    console.error("Error updating payment method:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "A payment method with this name already exists",
      });
    }
    res.status(500).json({ success: false, error: "Failed to update payment method" });
  }
};

// Soft delete a payment method (only user's own, not system defaults)
export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if this is user's own payment method (not system default)
    const existing = await pool.query(
      `SELECT payment_method_id, user_id, name FROM payment_methods
       WHERE payment_method_id = $1 AND is_deleted = FALSE`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Payment method not found" });
    }

    if (existing.rows[0].user_id === null) {
      return res.status(403).json({
        success: false,
        error: "Cannot delete system default payment methods",
      });
    }

    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Soft delete - preserves order history
    await pool.query(
      `UPDATE payment_methods
       SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
       WHERE payment_method_id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: `Payment method "${existing.rows[0].name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ success: false, error: "Failed to delete payment method" });
  }
};

// Toggle active status of a payment method (user's own only)
export const togglePaymentMethodStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if this is user's own payment method
    const existing = await pool.query(
      `SELECT payment_method_id, user_id, is_active FROM payment_methods
       WHERE payment_method_id = $1 AND is_deleted = FALSE`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Payment method not found" });
    }

    if (existing.rows[0].user_id === null) {
      return res.status(403).json({
        success: false,
        error: "Cannot modify system default payment methods",
      });
    }

    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const newStatus = !existing.rows[0].is_active;

    const result = await pool.query(
      `UPDATE payment_methods
       SET is_active = $1, updated_at = NOW()
       WHERE payment_method_id = $2
       RETURNING payment_method_id, name, is_active, user_id, created_at, updated_at`,
      [newStatus, id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        is_system_default: false,
      },
    });
  } catch (error) {
    console.error("Error toggling payment method status:", error);
    res.status(500).json({ success: false, error: "Failed to update payment method" });
  }
};

export default {
  getPaymentMethods,
  getActivePaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
};
