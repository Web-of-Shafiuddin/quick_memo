import { Request, Response } from "express";
import pool from "../config/database.js";

// --- Attribute Definitions ---

export const getAllAttributeDefinitions = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT ad.*, 
        (SELECT json_agg(av.*) FROM attribute_values av WHERE av.attribute_def_id = ad.attribute_def_id) as values
       FROM attribute_definitions ad
       WHERE ad.user_id = $1
       ORDER BY ad.name ASC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching attribute definitions:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch attributes" });
  }
};

export const createAttributeDefinition = async (
  req: Request,
  res: Response
) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Attribute name is required" });
    }

    const result = await pool.query(
      "INSERT INTO attribute_definitions (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, userId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating attribute definition:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ success: false, error: "Attribute name already exists" });
    }
    res
      .status(500)
      .json({ success: false, error: "Failed to create attribute" });
  }
};

export const updateAttributeDefinition = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      "UPDATE attribute_definitions SET name = $1 WHERE attribute_def_id = $2 AND user_id = $3 RETURNING *",
      [name, id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Attribute not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error updating attribute definition:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update attribute" });
  }
};

export const deleteAttributeDefinition = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      "DELETE FROM attribute_definitions WHERE attribute_def_id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Attribute not found" });
    }

    res.json({ success: true, message: "Attribute deleted successfully" });
  } catch (error) {
    console.error("Error deleting attribute definition:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete attribute" });
  }
};

// --- Attribute Values ---

export const createAttributeValue = async (req: Request, res: Response) => {
  try {
    const { attribute_def_id, value } = req.body;
    const userId = req.userId;

    // Verify ownership of definition
    const defCheck = await pool.query(
      "SELECT attribute_def_id FROM attribute_definitions WHERE attribute_def_id = $1 AND user_id = $2",
      [attribute_def_id, userId]
    );

    if (defCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Attribute definition not found" });
    }

    const result = await pool.query(
      "INSERT INTO attribute_values (attribute_def_id, value) VALUES ($1, $2) RETURNING *",
      [attribute_def_id, value]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating attribute value:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({
          success: false,
          error: "Value already exists for this attribute",
        });
    }
    res
      .status(500)
      .json({ success: false, error: "Failed to create attribute value" });
  }
};

export const deleteAttributeValue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check ownership through join
    const result = await pool.query(
      `DELETE FROM attribute_values av
       USING attribute_definitions ad
       WHERE av.attribute_def_id = ad.attribute_def_id 
       AND av.attribute_value_id = $1 
       AND ad.user_id = $2 
       RETURNING av.*`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Attribute value not found" });
    }

    res.json({
      success: true,
      message: "Attribute value deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attribute value:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete attribute value" });
  }
};
