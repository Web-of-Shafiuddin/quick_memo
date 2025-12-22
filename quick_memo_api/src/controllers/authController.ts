import bcrypt from "bcrypt";
import { Request, Response } from "express";
import pool from "../config/database.js";
import jwt from "jsonwebtoken";

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

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // is user exists
    const user = await pool.query(
      'SELECT user_id, name, email, mobile, password, shop_name, shop_owner_name, shop_mobile, shop_email, shop_address, shop_logo_url, created_at, updated_at FROM "users" WHERE email = $1',
      [email]
    );
    if (user.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    // is password valid
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    // remove password from user object
    delete user.rows[0].password;

    // generate token
    const token = process.env.JWT_SECRET
      ? jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        })
      : null;

    //send cookie to the browser
    if (token) {
      res.cookie("quick_memo_user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      });
    }

    res.status(200).json({ success: true, data: user.rows[0], token });
  } catch (error: any) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, error: "Failed to log in" });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    const user = await pool.query(
      'SELECT user_id, name, email, mobile, shop_name, shop_owner_name, shop_mobile, shop_email, shop_address, shop_logo_url, created_at, updated_at FROM "users" WHERE user_id = $1',
      [req.userId]
    );
    if (user.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized" });
    }
    res.status(200).json({ success: true, data: user.rows[0] });
  } catch (err) {
    console.error("Error validating token:", err);
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

