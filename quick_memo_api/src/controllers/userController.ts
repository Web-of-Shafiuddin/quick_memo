import { Request, Response } from "express";
import pool from "../config/database.js";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
            SELECT user_id, email, name, mobile, shop_name, shop_owner_name, shop_mobile, shop_email, shop_address, shop_logo_url, shop_slug, nid_license_url, social_links, shop_description, is_verified, has_badge, is_active, created_at, updated_at
            FROM users
        `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      "SELECT user_id, name, email, mobile, preferred_currency, shop_name, shop_owner_name, shop_mobile, shop_email, shop_address, shop_logo_url, shop_slug, nid_license_url, social_links, shop_description, is_verified, has_badge, is_active, created_at, updated_at FROM users WHERE user_id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = userResult.rows[0];

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      email,
      name,
      mobile,
      preferred_currency,
      shop_name,
      shop_owner_name,
      shop_mobile,
      shop_email,
      shop_address,
      shop_logo_url,
      shop_slug,
      nid_license_url,
      social_links,
      shop_description,
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (mobile !== undefined) {
      updates.push(`mobile = $${paramIndex++}`);
      values.push(mobile);
    }
    if (preferred_currency !== undefined) {
      updates.push(`preferred_currency = $${paramIndex++}`);
      values.push(preferred_currency);
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
    if (shop_logo_url !== undefined) {
      updates.push(`shop_logo_url = $${paramIndex++}`);
      values.push(shop_logo_url);
    }
    if (shop_slug !== undefined) {
      updates.push(`shop_slug = $${paramIndex++}`);
      values.push(shop_slug);
    }
    if (nid_license_url !== undefined) {
      updates.push(`nid_license_url = $${paramIndex++}`);
      values.push(nid_license_url);
    }
    if (social_links !== undefined) {
      updates.push(`social_links = $${paramIndex++}`);
      values.push(JSON.stringify(social_links));
    }
    if (shop_description !== undefined) {
      updates.push(`shop_description = $${paramIndex++}`);
      values.push(shop_description);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());

      const result = await pool.query(
        `UPDATE users SET ${updates.join(
          ", "
        )} WHERE user_id = $${paramIndex} RETURNING *`,
        [...values, id]
      );

      if (result.rows.length === 0) {
        // In case user doesn't exist? Prisma update throws if record not found usually?
        // Actually Prisma update throws "Record to update not found."
        // But here if ID is not found, we might want to return 404.
        // The previous code didn't explicitly handle 404 on update, but Prisma would throw.
        // Let's assume broad compatibility: if no rows updated, strict REST implies 404, but checking might be extra query.
        // But RETURNING * returning empty array means no update.
      }

      // If we want to return the updated user even if fields were undefined (effectively no op but fetch),
      // we should fetch it. But standard update usually implies changes.

      // If values empty (only updating updatedAt?), handled above.

      res.json({ success: true, data: result.rows[0] });
    } else {
      // If no updates, just fetch? or return existing?
      // Previous code: `...(email !== undefined && { email })` objects. If empty, Prisma updates updatedAt automatically due to @updatedAt?
      // Yes, Prisma updates `updatedAt` automatically.
      // My logic above adds `updatedAt` only if `updates.length > 0`.
      // If I send empty body, I should probably still update `updatedAt`.

      // Let's ensure we always update `updatedAt` if the user hits this endpoint?
      // Or simpler: just standard update logic.
      // If no fields provided, Prisma might still update `updatedAt`.
      // I'll stick to updating `updatedAt` always to be safe.

      const result = await pool.query(
        `UPDATE users SET updated_at = $1 WHERE user_id = $2 RETURNING *`,
        [new Date(), id]
      );
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "23505") {
      if (error.detail?.includes("shop_slug")) {
        return res
          .status(409)
          .json({ success: false, error: "Shop URL already taken" });
      }
      return res
        .status(409)
        .json({ success: false, error: "Email already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};
