import { Request, Response } from 'express';
import pool from '../config/database.js';

export const addPayment = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { invoice_id, amount_paid, payment_method, reference_number, notes } = req.body;
    const userId = req.userId;

    if (!invoice_id || !amount_paid || amount_paid <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invoice ID and valid payment amount are required',
      });
    }

    await client.query('BEGIN');

    // Verify invoice belongs to user and get current details
    const invoiceResult = await client.query(
      `SELECT * FROM invoices WHERE invoice_id = $1 AND user_id = $2`,
      [invoice_id, userId]
    );

    if (invoiceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    if (invoice.status === 'VOID') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Cannot add payment to voided invoice' });
    }

    if (invoice.status === 'PAID') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Invoice is already fully paid' });
    }

    // Get current total payments
    const paymentsResult = await client.query(
      'SELECT COALESCE(SUM(amount_paid), 0) as total_paid FROM payment_records WHERE invoice_id = $1',
      [invoice_id]
    );
    const currentTotalPaid = parseFloat(paymentsResult.rows[0].total_paid);

    const newTotalPaid = currentTotalPaid + amount_paid;

    if (newTotalPaid > invoice.total_amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `Payment amount exceeds remaining balance. Maximum payable: ${invoice.total_amount - currentTotalPaid}`,
      });
    }

    // Insert payment record
    const paymentResult = await client.query(
      `INSERT INTO payment_records
       (invoice_id, amount_paid, payment_method, reference_number, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [invoice_id, amount_paid, payment_method || null, reference_number || null, notes || null]
    );

    // Update invoice amount_paid and status
    let newStatus = 'PARTIAL';
    if (Math.abs(newTotalPaid - invoice.total_amount) < 0.01) {
      newStatus = 'PAID';
    }

    await client.query(
      `UPDATE invoices
       SET amount_paid = $1, status = $2
       WHERE invoice_id = $3`,
      [newTotalPaid, newStatus, invoice_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        payment: paymentResult.rows[0],
        invoice_status: newStatus,
        amount_paid: newTotalPaid,
        remaining_balance: invoice.total_amount - newTotalPaid,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding payment:', error);
    res.status(500).json({ success: false, error: 'Failed to add payment' });
  } finally {
    client.release();
  }
};

export const getPaymentsByInvoice = async (req: Request, res: Response) => {
  try {
    const { invoice_id } = req.params;
    const userId = req.userId;

    // Verify invoice belongs to user
    const invoiceCheck = await pool.query(
      'SELECT invoice_id FROM invoices WHERE invoice_id = $1 AND user_id = $2',
      [invoice_id, userId]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const result = await pool.query(
      `SELECT * FROM payment_records WHERE invoice_id = $1 ORDER BY payment_date DESC`,
      [invoice_id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payments' });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const userId = req.userId;

    await client.query('BEGIN');

    // Get payment and verify invoice belongs to user
    const paymentResult = await pool.query(
      `SELECT pr.*, i.user_id, i.invoice_id, i.total_amount, i.amount_paid as current_amount_paid
       FROM payment_records pr
       JOIN invoices i ON pr.invoice_id = i.invoice_id
       WHERE pr.payment_id = $1`,
      [id]
    );

    if (paymentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    if (payment.user_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Delete payment record
    await pool.query('DELETE FROM payment_records WHERE payment_id = $1', [id]);

    // Recalculate invoice amount_paid and update status
    const remainingPaymentsResult = await pool.query(
      'SELECT COALESCE(SUM(amount_paid), 0) as total FROM payment_records WHERE invoice_id = $1',
      [payment.invoice_id]
    );
    const newAmountPaid = parseFloat(remainingPaymentsResult.rows[0].total);

    let newStatus = 'DUE';
    if (newAmountPaid > 0) {
      if (Math.abs(newAmountPaid - payment.total_amount) < 0.01) {
        newStatus = 'PAID';
      } else {
        newStatus = 'PARTIAL';
      }
    }

    await pool.query(
      `UPDATE invoices SET amount_paid = $1, status = $2 WHERE invoice_id = $3`,
      [newAmountPaid, newStatus, payment.invoice_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        message: 'Payment deleted successfully',
        new_amount_paid: newAmountPaid,
        new_status: newStatus,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete payment' });
  } finally {
    client.release();
  }
};
