import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { search } = req.query;

    let query = `
      SELECT c.*,
      COUNT(DISTINCT oh.transaction_id)::int as order_count,
      COALESCE(SUM(oh.total_amount), 0)::numeric as total_spent
      FROM customers c
      LEFT JOIN order_headers oh ON c.customer_id = oh.customer_id
      WHERE c.user_id = $1
    `;
    const params: any[] = [userId];

    if (search) {
      query += ` AND (c.name ILIKE $2 OR c.email ILIKE $2 OR c.mobile ILIKE $2)`;
      params.push(`%${search}%`);
    }

    query += ' GROUP BY c.customer_id ORDER BY c.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM customers WHERE customer_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Get customer's orders
    const ordersResult = await pool.query(
      `SELECT * FROM order_headers
       WHERE customer_id = $1 AND user_id = $2
       ORDER BY order_date DESC`,
      [id, userId]
    );

    const customer = {
      ...result.rows[0],
      orders: ordersResult.rows,
    };

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, address } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Customer name is required',
      });
    }

    const result = await pool.query(
      `INSERT INTO customers (user_id, name, email, mobile, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, email || null, mobile || null, address || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Customer email already exists for this business' });
    }
    res.status(500).json({ success: false, error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['name', 'email', 'mobile', 'address'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    values.push(id, userId);
    const query = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE customer_id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Customer email already exists for this business' });
    }
    res.status(500).json({ success: false, error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if customer has orders
    const ordersCheck = await pool.query(
      'SELECT COUNT(*) as order_count FROM order_headers WHERE customer_id = $1',
      [id]
    );

    if (parseInt(ordersCheck.rows[0].order_count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete customer with existing orders',
      });
    }

    const result = await pool.query(
      'DELETE FROM customers WHERE customer_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, error: 'Failed to delete customer' });
  }
};
