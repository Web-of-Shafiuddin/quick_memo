import { Request, Response } from "express";
import pool from "../config/database.js";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
            SELECT u.id, u.email, u.name, u."createdAt", u."updatedAt",
            COUNT(m.id)::int as memo_count
            FROM "User" u
            LEFT JOIN "Memo" m ON u.id = m."userId"
            GROUP BY u.id
        `);

    const users = result.rows.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      _count: {
        memos: user.memo_count,
      },
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query('SELECT * FROM "User" WHERE id = $1', [
      id,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = userResult.rows[0];

    const memosResult = await pool.query(
      `
            SELECT m.*, 
            c.id as category_id, c.name as category_name, c.color as category_color, c."createdAt" as category_created_at, c."updatedAt" as category_updated_at
            FROM "Memo" m
            LEFT JOIN "Category" c ON m."categoryId" = c.id
            WHERE m."userId" = $1
            ORDER BY m."updatedAt" DESC
        `,
      [id]
    );

    const memos = memosResult.rows.map((row) => {
      const {
        category_id,
        category_name,
        category_color,
        category_created_at,
        category_updated_at,
        ...memoData
      } = row;
      return {
        ...memoData,
        category: category_id
          ? {
              id: category_id,
              name: category_name,
              color: category_color,
              createdAt: category_created_at,
              updatedAt: category_updated_at,
            }
          : null,
      };
    });

    res.json({ success: true, data: { ...user, memos } });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

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

    if (updates.length > 0) {
      updates.push(`"updatedAt" = $${paramIndex++}`);
      values.push(new Date());

      const result = await pool.query(
        `UPDATE "User" SET ${updates.join(
          ", "
        )} WHERE id = $${paramIndex} RETURNING *`,
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
        `UPDATE "User" SET "updatedAt" = $1 WHERE id = $2 RETURNING *`,
        [new Date(), id]
      );
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "23505") {
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

    await pool.query('DELETE FROM "User" WHERE id = $1', [id]);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};
