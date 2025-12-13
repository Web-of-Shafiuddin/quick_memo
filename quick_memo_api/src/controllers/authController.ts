import bcrypt from "bcrypt";
import { Request, Response } from "express";
import pool from "../config/database.js";

export const userRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, password } = req.body;

    const alreadyExists = await pool.query(
      'SELECT * FROM "users" WHERE email = $1',
      [email]
    );
    if (alreadyExists.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, error: "Email already exists" });
    }
    //encrypt password
    const encryptedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO "users" (name, email, mobile, password) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, mobile',
      [name, email, mobile, encryptedPassword]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === "23505") {
      // unique_violation
      return res
        .status(409)
        .json({ success: false, error: "Email already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to create user" });
  }
};