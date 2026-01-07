import { Request, Response } from "express";
import pool from "../config/database.js";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { category_id, status, search, include_variants, page = 1, limit = 10, sortBy = "created_at", sortOrder = "DESC" } = req.query;

    const pageNum = parseInt(page as string) || 1;
    let limitNum = parseInt(limit as string) || 10;
    if (limitNum > 100) limitNum = 100;
    const offset = (pageNum - 1) * limitNum;

    const allowedSortFields = ["name", "price", "stock", "created_at", "status", "sku"];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy as string : "created_at";
    const sortDirection = (sortOrder as string).toUpperCase() === "ASC" ? "ASC" : "DESC";

    let baseQuery = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.user_id = $1
    `;

    if (include_variants !== "true") {
      baseQuery += ` AND p.parent_product_id IS NULL`;
    }

    const params: any[] = [userId];
    let paramIndex = 2;

    if (category_id) {
      baseQuery += ` AND p.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (status) {
      baseQuery += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      baseQuery += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const totalCount = parseInt(countResult.rows[0].count);

    let query = `
      SELECT p.*, c.name as category_name,
             (SELECT COUNT(*) FROM products v WHERE v.parent_product_id = p.product_id) as variant_count
      ${baseQuery}
    `;

    query += ` ORDER BY p.${sortField} ${sortDirection}`;

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = $1 AND p.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Get variants if this is a parent product
    const variantsResult = await pool.query(
      "SELECT * FROM products WHERE parent_product_id = $1",
      [id]
    );

    // Get variant attributes if this product has a parent
    const attributesResult = await pool.query(
      "SELECT * FROM product_variant_attributes WHERE product_id = $1",
      [id]
    );

    // Get gallery images
    const galleryResult = await pool.query(
      "SELECT * FROM product_gallery_images WHERE product_id = $1",
      [id]
    );

    const product = {
      ...result.rows[0],
      variants: variantsResult.rows,
      attributes: attributesResult.rows,
      gallery_images: galleryResult.rows,
    };

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, error: "Failed to fetch product" });
  }
};

export const getProductBySku = async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name
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

    // Get gallery images
    const galleryResult = await pool.query(
      "SELECT * FROM product_gallery_images WHERE product_id = $1",
      [product.product_id]
    );

    res.json({
      success: true,
      data: { ...product, gallery_images: galleryResult.rows },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, error: "Failed to fetch product" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    let {
      sku,
      name,
      category_id,
      price,
      discount = 0,
      stock = 0,
      status = "ACTIVE",
      image,
      parent_product_id,
      attributes = [],
      description,
      video_url,
      gallery_images = [], // Array of { image_url, attribute_value }
    } = req.body;
    const userId = req.userId;

    // Auto-generate SKU if not provided
    if (!sku) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      sku = `SKU-${timestamp}-${random}`;
    }

    // Check if category belongs to user
    const categoryCheck = await pool.query(
      "SELECT category_id FROM categories WHERE category_id = $1 AND user_id = $2",
      [category_id, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }

    const result = await pool.query(
      `INSERT INTO products
       (user_id, sku, name, category_id, price, discount, stock, status, image, parent_product_id, description, video_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        userId,
        sku,
        name,
        category_id,
        price,
        discount,
        stock,
        status,
        image || null,
        parent_product_id || null,
        description || null,
        video_url || null,
      ]
    );

    const product = result.rows[0];

    // Add attributes if provided
    const createdAttributes = [];
    for (const attr of attributes) {
      if (attr.attribute_name && attr.attribute_value) {
        const attrResult = await pool.query(
          `INSERT INTO product_variant_attributes (product_id, attribute_name, attribute_value)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [product.product_id, attr.attribute_name, attr.attribute_value]
        );
        createdAttributes.push(attrResult.rows[0]);
      }
    }

    // Add gallery images
    const createdGallery = [];
    if (Array.isArray(gallery_images)) {
      for (const img of gallery_images) {
        if (img.image_url) {
          const galleryResult = await pool.query(
            `INSERT INTO product_gallery_images (product_id, image_url, attribute_value)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [product.product_id, img.image_url, img.attribute_value || null]
          );
          createdGallery.push(galleryResult.rows[0]);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...product,
        attributes: createdAttributes,
        gallery_images: createdGallery,
      },
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ success: false, error: "Product SKU already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to create product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { attributes, gallery_images, ...updateData } = req.body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      "sku",
      "name",
      "category_id",
      "price",
      "discount",
      "stock",
      "status",
      "image",
      "parent_product_id",
      "description",
      "video_url",
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
        paramIndex++;
      }
    }

    // If category_id is being updated, verify it belongs to the user
    if (updateData.category_id) {
      const categoryCheck = await pool.query(
        "SELECT category_id FROM categories WHERE category_id = $1 AND user_id = $2",
        [updateData.category_id, userId]
      );

      if (categoryCheck.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Category not found" });
      }
    }

    let product;

    // Only update product fields if there are any
    if (updates.length > 0) {
      values.push(id, userId);
      const query = `
        UPDATE products
        SET ${updates.join(", ")}
        WHERE product_id = $${paramIndex} AND user_id = $${paramIndex + 1}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Product not found" });
      }
      product = result.rows[0];
    } else {
      // Verify product exists
      const productCheck = await pool.query(
        "SELECT * FROM products WHERE product_id = $1 AND user_id = $2",
        [id, userId]
      );
      if (productCheck.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Product not found" });
      }
      product = productCheck.rows[0];
    }

    // Handle attributes if provided
    if (Array.isArray(attributes)) {
      // Delete existing attributes
      await pool.query(
        "DELETE FROM product_variant_attributes WHERE product_id = $1",
        [id]
      );

      // Insert new attributes
      const createdAttributes = [];
      for (const attr of attributes) {
        if (attr.attribute_name && attr.attribute_value) {
          const attrResult = await pool.query(
            `INSERT INTO product_variant_attributes (product_id, attribute_name, attribute_value)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id, attr.attribute_name, attr.attribute_value]
          );
          createdAttributes.push(attrResult.rows[0]);
        }
      }
      product.attributes = createdAttributes;
    } else {
      // Fetch existing attributes
      const attrResult = await pool.query(
        "SELECT * FROM product_variant_attributes WHERE product_id = $1",
        [id]
      );
      product.attributes = attrResult.rows;
    }

    // Handle gallery images if provided
    if (Array.isArray(gallery_images)) {
      // Delete existing gallery images (simple replace strategy for now)
      // Or we can differentiate between new/delete? For simplicity, we'll replace or we can check IDs.
      // Replace strategy is easier for "save form" behavior
      await pool.query(
        "DELETE FROM product_gallery_images WHERE product_id = $1",
        [id]
      );

      const createdGallery = [];
      for (const img of gallery_images) {
        if (img.image_url) {
          const galleryResult = await pool.query(
            `INSERT INTO product_gallery_images (product_id, image_url, attribute_value)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id, img.image_url, img.attribute_value || null]
          );
          createdGallery.push(galleryResult.rows[0]);
        }
      }
      product.gallery_images = createdGallery;
    } else {
      const galleryResult = await pool.query(
        "SELECT * FROM product_gallery_images WHERE product_id = $1",
        [id]
      );
      product.gallery_images = galleryResult.rows;
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error updating product:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ success: false, error: "Product SKU already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      "DELETE FROM products WHERE product_id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, error: "Failed to delete product" });
  }
};

export const addVariantAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { attribute_name, attribute_value } = req.body;
    const userId = req.userId;

    // Verify product belongs to user
    const productCheck = await pool.query(
      "SELECT product_id FROM products WHERE product_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (productCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const result = await pool.query(
      `INSERT INTO product_variant_attributes (product_id, attribute_name, attribute_value)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, attribute_name, attribute_value]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error adding variant attribute:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to add variant attribute" });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const userId = req.userId;

    if (typeof stock !== "number" || stock < 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid stock value" });
    }

    const result = await pool.query(
      "UPDATE products SET stock = $1 WHERE product_id = $2 AND user_id = $3 RETURNING *",
      [stock, id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, error: "Failed to update stock" });
  }
};

// Get all variants for a product
export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify parent product belongs to user
    const productCheck = await pool.query(
      "SELECT product_id FROM products WHERE product_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (productCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Get all variant products
    const variantsResult = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.parent_product_id = $1`,
      [id]
    );

    // Get attributes for each variant
    const variantsWithAttributes = await Promise.all(
      variantsResult.rows.map(async (variant) => {
        const attributesResult = await pool.query(
          "SELECT * FROM product_variant_attributes WHERE product_id = $1",
          [variant.product_id]
        );
        return {
          ...variant,
          attributes: attributesResult.rows,
        };
      })
    );

    res.json({ success: true, data: variantsWithAttributes });
  } catch (error) {
    console.error("Error fetching product variants:", error);
    res.status(500).json({ success: false, error: "Failed to fetch variants" });
  }
};

// Create a variant for a product
export const createVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    let {
      sku,
      name,
      price,
      discount = 0,
      stock = 0,
      status = "ACTIVE",
      image,
      attributes = [],
    } = req.body;

    // Verify parent product belongs to user and get its category
    const parentProduct = await pool.query(
      "SELECT product_id, category_id, name FROM products WHERE product_id = $1 AND user_id = $2 AND parent_product_id IS NULL",
      [id, userId]
    );

    if (parentProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Parent product not found or is already a variant",
      });
    }

    const parent = parentProduct.rows[0];

    // Auto-generate SKU for variant if not provided
    if (!sku) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      sku = `VAR-${id}-${timestamp}-${random}`;
    }

    // Use parent name if no name provided
    const variantName = name || `${parent.name} Variant`;

    // Create the variant product
    const variantResult = await pool.query(
      `INSERT INTO products
       (user_id, sku, name, category_id, price, discount, stock, status, image, parent_product_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        sku,
        variantName,
        parent.category_id,
        price,
        discount,
        stock,
        status,
        image || null,
        id,
      ]
    );

    const variant = variantResult.rows[0];

    // Add attributes if provided
    const createdAttributes = [];
    for (const attr of attributes) {
      if (attr.attribute_name && attr.attribute_value) {
        const attrResult = await pool.query(
          `INSERT INTO product_variant_attributes (product_id, attribute_name, attribute_value)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [variant.product_id, attr.attribute_name, attr.attribute_value]
        );
        createdAttributes.push(attrResult.rows[0]);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...variant,
        attributes: createdAttributes,
      },
    });
  } catch (error: any) {
    console.error("Error creating variant:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ success: false, error: "Variant SKU already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to create variant" });
  }
};

export const bulkCreateVariants = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { variants } = req.body; // Array of variant objects

    if (!Array.isArray(variants) || variants.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Variants must be a non-empty array" });
    }

    // Verify parent product
    const parentProduct = await pool.query(
      "SELECT product_id, category_id, name FROM products WHERE product_id = $1 AND user_id = $2 AND parent_product_id IS NULL",
      [id, userId]
    );

    if (parentProduct.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Parent product not found" });
    }

    const parent = parentProduct.rows[0];
    const createdVariants = [];

    await client.query("BEGIN");

    for (const v of variants) {
      const {
        sku: variantSku,
        name: variantName,
        price,
        discount = 0,
        stock = 0,
        status = "ACTIVE",
        image,
        attributes = [],
      } = v;

      // Auto-generate SKU
      let sku = variantSku;
      if (!sku) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        sku = `VAR-${id}-${timestamp}-${random}`;
      }

      const name = variantName || `${parent.name} Variant`;

      // Insert variant
      const vResult = await client.query(
        `INSERT INTO products
         (user_id, sku, name, category_id, price, discount, stock, status, image, parent_product_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          sku,
          name,
          parent.category_id,
          price,
          discount,
          stock,
          status,
          image || null,
          id,
        ]
      );

      const variant = vResult.rows[0];

      // Insert attributes
      const createdAttributes = [];
      for (const attr of attributes) {
        if (attr.attribute_name && attr.attribute_value) {
          const attrResult = await client.query(
            `INSERT INTO product_variant_attributes (product_id, attribute_name, attribute_value)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [variant.product_id, attr.attribute_name, attr.attribute_value]
          );
          createdAttributes.push(attrResult.rows[0]);
        }
      }

      createdVariants.push({ ...variant, attributes: createdAttributes });
    }

    await client.query("COMMIT");
    res.status(201).json({ success: true, data: createdVariants });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error in bulk variant creation:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create variants in bulk" });
  } finally {
    client.release();
  }
};

// Update a variant attribute
export const updateVariantAttribute = async (req: Request, res: Response) => {
  try {
    const { id, attributeId } = req.params;
    const { attribute_name, attribute_value } = req.body;
    const userId = req.userId;

    // Verify product belongs to user
    const productCheck = await pool.query(
      "SELECT product_id FROM products WHERE product_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (productCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (attribute_name !== undefined) {
      updates.push(`attribute_name = $${paramIndex}`);
      values.push(attribute_name);
      paramIndex++;
    }

    if (attribute_value !== undefined) {
      updates.push(`attribute_value = $${paramIndex}`);
      values.push(attribute_value);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No fields to update" });
    }

    values.push(attributeId, id);
    const query = `
      UPDATE product_variant_attributes
      SET ${updates.join(", ")}
      WHERE attribute_id = $${paramIndex} AND product_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Attribute not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating variant attribute:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update attribute" });
  }
};

// Delete a variant attribute
export const deleteVariantAttribute = async (req: Request, res: Response) => {
  try {
    const { id, attributeId } = req.params;
    const userId = req.userId;

    // Verify product belongs to user
    const productCheck = await pool.query(
      "SELECT product_id FROM products WHERE product_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (productCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const result = await pool.query(
      "DELETE FROM product_variant_attributes WHERE attribute_id = $1 AND product_id = $2 RETURNING *",
      [attributeId, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Attribute not found" });
    }

    res.json({ success: true, message: "Attribute deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant attribute:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete attribute" });
  }
};

// Get all attributes for a variant product
export const getVariantAttributes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify product belongs to user
    const productCheck = await pool.query(
      "SELECT product_id FROM products WHERE product_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (productCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const result = await pool.query(
      "SELECT * FROM product_variant_attributes WHERE product_id = $1 ORDER BY attribute_name",
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching variant attributes:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch attributes" });
  }
};
