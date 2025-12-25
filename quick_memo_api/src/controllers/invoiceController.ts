import { Request, Response } from 'express';
import pool from '../config/database.js';

// Get all invoices for the user
export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { status, customer_id, start_date, end_date } = req.query;

    let query = `
      SELECT
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.mobile as customer_mobile,
        c.address as customer_address,
        oh.order_status,
        oh.order_source
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.customer_id
      LEFT JOIN order_headers oh ON i.transaction_id = oh.transaction_id
      WHERE i.user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customer_id) {
      query += ` AND i.customer_id = $${paramIndex}`;
      params.push(customer_id);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND i.issue_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND i.issue_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
};

// Get invoice by ID with full details
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get invoice
    const invoiceResult = await pool.query(
      `SELECT
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.mobile as customer_mobile,
        c.address as customer_address,
        oh.order_status,
        oh.order_source,
        oh.shipping_amount,
        oh.tax_amount,
        pm.name as payment_method_name
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       LEFT JOIN order_headers oh ON i.transaction_id = oh.transaction_id
       LEFT JOIN payment_methods pm ON oh.payment_method_id = pm.payment_method_id
       WHERE i.invoice_id = $1 AND i.user_id = $2`,
      [id, userId]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        p.sku as product_sku,
        p.image as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.product_id
       WHERE oi.transaction_id = $1`,
      [invoiceResult.rows[0].transaction_id]
    );

    const invoice = {
      ...invoiceResult.rows[0],
      items: itemsResult.rows,
    };

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoice' });
  }
};

// Get invoice by invoice number
export const getInvoiceByNumber = async (req: Request, res: Response) => {
  try {
    const { invoiceNumber } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.mobile as customer_mobile,
        c.address as customer_address
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       WHERE i.invoice_number = $1 AND i.user_id = $2`,
      [invoiceNumber, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoice' });
  }
};

// Create invoice from order
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const {
      transaction_id,
      due_date,
      notes,
    } = req.body;
    const userId = req.userId;

    // Verify order belongs to user and get details
    const orderResult = await pool.query(
      `SELECT oh.*, c.customer_id, c.name as customer_name
       FROM order_headers oh
       LEFT JOIN customers c ON oh.customer_id = c.customer_id
       WHERE oh.transaction_id = $1 AND oh.user_id = $2`,
      [transaction_id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check if invoice already exists for this order
    const existingInvoice = await pool.query(
      'SELECT invoice_id FROM invoices WHERE transaction_id = $1',
      [transaction_id]
    );

    if (existingInvoice.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Invoice already exists for this order',
        invoice_id: existingInvoice.rows[0].invoice_id
      });
    }

    // Generate invoice number (format: INV-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM invoices WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
      [userId, year]
    );
    const invoiceCount = parseInt(countResult.rows[0].count) + 1;
    const invoiceNumber = `INV-${year}-${invoiceCount.toString().padStart(5, '0')}`;

    // Create invoice
    const result = await pool.query(
      `INSERT INTO invoices
       (invoice_number, transaction_id, user_id, customer_id, issue_date, due_date, total_amount, status, notes)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, 'DUE', $7)
       RETURNING *`,
      [
        invoiceNumber,
        transaction_id,
        userId,
        order.customer_id,
        due_date || null,
        order.total_amount,
        notes || null
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Invoice number already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create invoice' });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.userId;

    const validStatuses = ['DUE', 'PAID', 'OVERDUE', 'VOID', 'PARTIAL'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updates: string[] = [`status = $1`];
    const values: any[] = [status];
    let paramIndex = 2;

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }

    values.push(id, userId);

    const result = await pool.query(
      `UPDATE invoices
       SET ${updates.join(', ')}
       WHERE invoice_id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to update invoice' });
  }
};

// Update invoice details
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { due_date, notes, status } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      values.push(due_date);
      paramIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }

    if (status !== undefined) {
      const validStatuses = ['DUE', 'PAID', 'OVERDUE', 'VOID', 'PARTIAL'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    values.push(id, userId);

    const result = await pool.query(
      `UPDATE invoices
       SET ${updates.join(', ')}
       WHERE invoice_id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to update invoice' });
  }
};

// Delete invoice (void it)
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Instead of hard delete, mark as VOID
    const result = await pool.query(
      `UPDATE invoices
       SET status = 'VOID'
       WHERE invoice_id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice voided successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to delete invoice' });
  }
};

// Get invoice statistics
export const getInvoiceStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
        COUNT(*)::int as total_invoices,
        COUNT(CASE WHEN status = 'DUE' THEN 1 END)::int as due_invoices,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END)::int as paid_invoices,
        COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END)::int as overdue_invoices,
        COUNT(CASE WHEN status = 'VOID' THEN 1 END)::int as void_invoices,
        COALESCE(SUM(CASE WHEN status = 'DUE' THEN total_amount ELSE 0 END), 0)::numeric as total_due,
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END), 0)::numeric as total_paid,
        COALESCE(SUM(CASE WHEN status = 'OVERDUE' THEN total_amount ELSE 0 END), 0)::numeric as total_overdue
       FROM invoices
       WHERE user_id = $1`,
      [userId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoice statistics' });
  }
};

// Auto-generate invoice from order (called after order creation)
export const autoGenerateInvoice = async (transactionId: number, userId: number): Promise<any> => {
  try {
    // Get order details
    const orderResult = await pool.query(
      `SELECT oh.*, c.customer_id
       FROM order_headers oh
       LEFT JOIN customers c ON oh.customer_id = c.customer_id
       WHERE oh.transaction_id = $1 AND oh.user_id = $2`,
      [transactionId, userId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Generate invoice number
    const year = new Date().getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM invoices WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
      [userId, year]
    );
    const invoiceCount = parseInt(countResult.rows[0].count) + 1;
    const invoiceNumber = `INV-${year}-${invoiceCount.toString().padStart(5, '0')}`;

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice
    const result = await pool.query(
      `INSERT INTO invoices
       (invoice_number, transaction_id, user_id, customer_id, issue_date, due_date, total_amount, status)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, 'DUE')
       RETURNING *`,
      [
        invoiceNumber,
        transactionId,
        userId,
        order.customer_id,
        dueDate,
        order.total_amount
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error auto-generating invoice:', error);
    return null;
  }
};
