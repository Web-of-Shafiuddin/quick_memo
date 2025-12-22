import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { status, customer_id, start_date, end_date, order_source } = req.query;

    let query = `
      SELECT
        oh.*,
        c.name as customer_name,
        c.email as customer_email,
        c.mobile as customer_mobile,
        c.address as customer_address,
        pm.name as payment_method_name
      FROM order_headers oh
      LEFT JOIN customers c ON oh.customer_id = c.customer_id
      LEFT JOIN payment_methods pm ON oh.payment_method_id = pm.payment_method_id
      WHERE oh.user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND oh.order_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customer_id) {
      query += ` AND oh.customer_id = $${paramIndex}`;
      params.push(customer_id);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND oh.order_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND oh.order_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (order_source) {
      query += ` AND oh.order_source = $${paramIndex}`;
      params.push(order_source);
      paramIndex++;
    }

    query += ' ORDER BY oh.order_date DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get order header
    const orderResult = await pool.query(
      `SELECT
        oh.*,
        c.name as customer_name,
        c.email as customer_email,
        c.mobile as customer_mobile,
        c.address as customer_address,
        pm.name as payment_method_name
       FROM order_headers oh
       LEFT JOIN customers c ON oh.customer_id = c.customer_id
       LEFT JOIN payment_methods pm ON oh.payment_method_id = pm.payment_method_id
       WHERE oh.transaction_id = $1 AND oh.user_id = $2`,
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        p.name as product_name,
        p.sku as product_sku,
        p.image as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.product_id
       WHERE oi.transaction_id = $1`,
      [id]
    );

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows,
    };

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      order_source = 'OFFLINE',
      order_status = 'PENDING',
      payment_method_id,
      shipping_amount = 0,
      tax_amount = 0,
      items,
    } = req.body;
    const userId = req.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one order item is required',
      });
    }

    await client.query('BEGIN');

    // Verify customer belongs to user
    const customerCheck = await client.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1 AND user_id = $2',
      [customer_id, userId]
    );

    if (customerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Calculate total amount
    let itemsTotal = 0;
    for (const item of items) {
      const subtotal = item.quantity * item.unit_price - (item.item_discount || 0);
      itemsTotal += subtotal;
    }

    const totalAmount = itemsTotal + shipping_amount + tax_amount;

    // Create order header
    const orderResult = await client.query(
      `INSERT INTO order_headers
       (user_id, customer_id, order_source, order_status, payment_method_id, shipping_amount, tax_amount, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, customer_id, order_source, order_status, payment_method_id, shipping_amount, tax_amount, totalAmount]
    );

    const transactionId = orderResult.rows[0].transaction_id;

    // Create order items and update product stock
    for (const item of items) {
      const { product_id, quantity, unit_price, item_discount = 0 } = item;

      // Verify product belongs to user and get product details
      const productCheck = await client.query(
        'SELECT product_id, name, stock FROM products WHERE product_id = $1 AND user_id = $2',
        [product_id, userId]
      );

      if (productCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: `Product ${product_id} not found` });
      }

      const product = productCheck.rows[0];

      // Check stock availability
      if (product.stock < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${quantity}`,
        });
      }

      const subtotal = quantity * unit_price - item_discount;

      // Insert order item
      await client.query(
        `INSERT INTO order_items
         (transaction_id, product_id, name_snapshot, quantity, unit_price, item_discount, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [transactionId, product_id, product.name, quantity, unit_price, item_discount, subtotal]
      );

      // Update product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE product_id = $2',
        [quantity, product_id]
      );
    }

    await client.query('COMMIT');

    // Fetch the complete order with items
    const completeOrder = await pool.query(
      `SELECT
        oh.*,
        c.name as customer_name,
        c.email as customer_email
       FROM order_headers oh
       LEFT JOIN customers c ON oh.customer_id = c.customer_id
       WHERE oh.transaction_id = $1`,
      [transactionId]
    );

    res.status(201).json({ success: true, data: completeOrder.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  } finally {
    client.release();
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['order_status', 'shipping_amount', 'tax_amount'];

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

    // Recalculate total if shipping or tax changed
    if (updateData.shipping_amount !== undefined || updateData.tax_amount !== undefined) {
      const orderCheck = await pool.query(
        'SELECT total_amount, shipping_amount, tax_amount FROM order_headers WHERE transaction_id = $1 AND user_id = $2',
        [id, userId]
      );

      if (orderCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const currentOrder = orderCheck.rows[0];
      const itemsTotal = currentOrder.total_amount - currentOrder.shipping_amount - currentOrder.tax_amount;
      const newShipping = updateData.shipping_amount ?? currentOrder.shipping_amount;
      const newTax = updateData.tax_amount ?? currentOrder.tax_amount;
      const newTotal = itemsTotal + newShipping + newTax;

      updates.push(`total_amount = $${paramIndex}`);
      values.push(newTotal);
      paramIndex++;
    }

    values.push(id, userId);
    const query = `
      UPDATE order_headers
      SET ${updates.join(', ')}
      WHERE transaction_id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const userId = req.userId;

    await client.query('BEGIN');

    // Get order details
    const orderCheck = await client.query(
      'SELECT order_status FROM order_headers WHERE transaction_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (orderCheck.rows[0].order_status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Order already cancelled' });
    }

    // Get order items to restore stock
    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE transaction_id = $1',
      [id]
    );

    // Restore stock for each item
    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE product_id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Update order status
    const result = await client.query(
      `UPDATE order_headers
       SET order_status = 'CANCELLED'
       WHERE transaction_id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    await client.query('COMMIT');

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel order' });
  } finally {
    client.release();
  }
};

export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND oh.order_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      dateFilter += ` AND oh.order_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    const statsQuery = `
      SELECT
        COUNT(DISTINCT oh.transaction_id)::int as total_orders,
        COUNT(DISTINCT oh.customer_id)::int as total_customers,
        COALESCE(SUM(oh.total_amount), 0)::numeric as total_revenue,
        COALESCE(AVG(oh.total_amount), 0)::numeric as average_order_value,
        COUNT(DISTINCT CASE WHEN oh.order_status = 'PENDING' THEN oh.transaction_id END)::int as pending_orders,
        COUNT(DISTINCT CASE WHEN oh.order_status = 'CONFIRMED' THEN oh.transaction_id END)::int as confirmed_orders,
        COUNT(DISTINCT CASE WHEN oh.order_status = 'SHIPPED' THEN oh.transaction_id END)::int as shipped_orders,
        COUNT(DISTINCT CASE WHEN oh.order_status = 'DELIVERED' THEN oh.transaction_id END)::int as delivered_orders,
        COUNT(DISTINCT CASE WHEN oh.order_status = 'CANCELLED' THEN oh.transaction_id END)::int as cancelled_orders
      FROM order_headers oh
      WHERE oh.user_id = $1 ${dateFilter}
    `;

    const result = await pool.query(statsQuery, params);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order statistics' });
  }
};
