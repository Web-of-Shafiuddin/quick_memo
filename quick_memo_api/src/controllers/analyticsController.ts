import { Request, Response } from 'express';
import pool from '../config/database.js';

// Dashboard overview stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Get total orders, revenue, customers, and products count
    const statsQuery = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM order_headers WHERE user_id = $1) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM order_headers WHERE user_id = $1) as total_revenue,
        (SELECT COUNT(*) FROM customers WHERE user_id = $1) as total_customers,
        (SELECT COUNT(*) FROM products WHERE user_id = $1) as total_products,
        (SELECT COUNT(*) FROM order_headers WHERE user_id = $1 AND order_status = 'PENDING') as pending_orders,
        (SELECT COUNT(*) FROM order_headers WHERE user_id = $1 AND order_status = 'DELIVERED') as delivered_orders
      `,
      [userId]
    );

    // Get this month's stats
    const thisMonthQuery = await pool.query(
      `SELECT
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM order_headers
       WHERE user_id = $1
         AND DATE_TRUNC('month', order_date) = DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    // Get last month's stats
    const lastMonthQuery = await pool.query(
      `SELECT
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM order_headers
       WHERE user_id = $1
         AND DATE_TRUNC('month', order_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')`,
      [userId]
    );

    const stats = statsQuery.rows[0];
    const thisMonth = thisMonthQuery.rows[0];
    const lastMonth = lastMonthQuery.rows[0];

    // Calculate growth percentages
    const revenueGrowth = lastMonth.revenue > 0
      ? ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue * 100).toFixed(1)
      : thisMonth.revenue > 0 ? 100 : 0;

    const orderGrowth = lastMonth.orders > 0
      ? ((thisMonth.orders - lastMonth.orders) / lastMonth.orders * 100).toFixed(1)
      : thisMonth.orders > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        totals: {
          orders: parseInt(stats.total_orders),
          revenue: parseFloat(stats.total_revenue),
          customers: parseInt(stats.total_customers),
          products: parseInt(stats.total_products),
          pendingOrders: parseInt(stats.pending_orders),
          deliveredOrders: parseInt(stats.delivered_orders),
        },
        thisMonth: {
          orders: parseInt(thisMonth.orders),
          revenue: parseFloat(thisMonth.revenue),
        },
        lastMonth: {
          orders: parseInt(lastMonth.orders),
          revenue: parseFloat(lastMonth.revenue),
        },
        growth: {
          revenue: parseFloat(revenueGrowth as string),
          orders: parseFloat(orderGrowth as string),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};

// Sales over time (for line chart)
export const getSalesOverTime = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { period = '30' } = req.query; // days

    const result = await pool.query(
      `SELECT
        DATE(order_date) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM order_headers
       WHERE user_id = $1
         AND order_date >= CURRENT_DATE - INTERVAL '${parseInt(period as string)} days'
       GROUP BY DATE(order_date)
       ORDER BY date ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        orders: parseInt(row.orders),
        revenue: parseFloat(row.revenue),
      })),
    });
  } catch (error) {
    console.error('Error fetching sales over time:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sales data' });
  }
};

// Top selling products
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { limit = '10' } = req.query;

    const result = await pool.query(
      `SELECT
        p.product_id,
        p.name,
        p.sku,
        p.image,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue,
        COUNT(DISTINCT oi.transaction_id) as order_count
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       JOIN order_headers oh ON oi.transaction_id = oh.transaction_id
       WHERE p.user_id = $1
       GROUP BY p.product_id, p.name, p.sku, p.image
       ORDER BY total_sold DESC
       LIMIT $2`,
      [userId, parseInt(limit as string)]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        total_sold: parseInt(row.total_sold),
        total_revenue: parseFloat(row.total_revenue),
        order_count: parseInt(row.order_count),
      })),
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top products' });
  }
};

// Top customers
export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { limit = '10' } = req.query;

    const result = await pool.query(
      `SELECT
        c.customer_id,
        c.name,
        c.email,
        c.mobile,
        COUNT(oh.transaction_id) as order_count,
        COALESCE(SUM(oh.total_amount), 0) as total_spent,
        MAX(oh.order_date) as last_order_date
       FROM customers c
       LEFT JOIN order_headers oh ON c.customer_id = oh.customer_id
       WHERE c.user_id = $1
       GROUP BY c.customer_id, c.name, c.email, c.mobile
       ORDER BY total_spent DESC
       LIMIT $2`,
      [userId, parseInt(limit as string)]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        order_count: parseInt(row.order_count),
        total_spent: parseFloat(row.total_spent),
      })),
    });
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top customers' });
  }
};

// Sales by category
export const getSalesByCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
        cat.category_id,
        cat.name as category_name,
        COUNT(DISTINCT oi.order_item_id) as items_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue
       FROM categories cat
       LEFT JOIN products p ON cat.category_id = p.category_id
       LEFT JOIN order_items oi ON p.product_id = oi.product_id
       WHERE cat.user_id = $1
       GROUP BY cat.category_id, cat.name
       ORDER BY total_revenue DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        items_sold: parseInt(row.items_sold),
        total_revenue: parseFloat(row.total_revenue),
      })),
    });
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch category sales' });
  }
};

// Sales by source (Facebook, Instagram, etc.)
export const getSalesBySource = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
        order_source,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_revenue
       FROM order_headers
       WHERE user_id = $1
       GROUP BY order_source
       ORDER BY total_revenue DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        order_count: parseInt(row.order_count),
        total_revenue: parseFloat(row.total_revenue),
      })),
    });
  } catch (error) {
    console.error('Error fetching sales by source:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch source sales' });
  }
};

// Order status distribution
export const getOrderStatusDistribution = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
        order_status,
        COUNT(*) as count
       FROM order_headers
       WHERE user_id = $1
       GROUP BY order_status
       ORDER BY count DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        status: row.order_status,
        count: parseInt(row.count),
      })),
    });
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order status' });
  }
};

// Recent orders
export const getRecentOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { limit = '5' } = req.query;

    const result = await pool.query(
      `SELECT
        oh.transaction_id,
        oh.order_date,
        oh.order_status,
        oh.total_amount,
        c.name as customer_name
       FROM order_headers oh
       JOIN customers c ON oh.customer_id = c.customer_id
       WHERE oh.user_id = $1
       ORDER BY oh.order_date DESC
       LIMIT $2`,
      [userId, parseInt(limit as string)]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        total_amount: parseFloat(row.total_amount),
      })),
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent orders' });
  }
};

// Low stock products alert
export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { threshold = '10' } = req.query;

    const result = await pool.query(
      `SELECT
        product_id,
        name,
        sku,
        stock,
        image
       FROM products
       WHERE user_id = $1 AND stock <= $2 AND status = 'ACTIVE'
       ORDER BY stock ASC
       LIMIT 10`,
      [userId, parseInt(threshold as string)]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        stock: parseInt(row.stock),
      })),
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch low stock products' });
  }
};

// Monthly revenue comparison (last 12 months)
export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
        DATE_TRUNC('month', order_date) as month,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM order_headers
       WHERE user_id = $1
         AND order_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
       GROUP BY DATE_TRUNC('month', order_date)
       ORDER BY month ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        month: row.month,
        orders: parseInt(row.orders),
        revenue: parseFloat(row.revenue),
      })),
    });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch monthly revenue' });
  }
};

// Sales prediction (simple moving average)
export const getSalesPrediction = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Get last 3 months of data
    const historicalData = await pool.query(
      `SELECT
        DATE_TRUNC('month', order_date) as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
       FROM order_headers
       WHERE user_id = $1
         AND order_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'
         AND order_date < DATE_TRUNC('month', CURRENT_DATE)
       GROUP BY DATE_TRUNC('month', order_date)
       ORDER BY month ASC`,
      [userId]
    );

    // Calculate simple moving average for prediction
    const revenues = historicalData.rows.map(r => parseFloat(r.revenue));
    const orders = historicalData.rows.map(r => parseInt(r.orders));

    const avgRevenue = revenues.length > 0
      ? revenues.reduce((a, b) => a + b, 0) / revenues.length
      : 0;
    const avgOrders = orders.length > 0
      ? Math.round(orders.reduce((a, b) => a + b, 0) / orders.length)
      : 0;

    // Simple trend calculation
    let revenueTrend = 0;
    let orderTrend = 0;
    if (revenues.length >= 2) {
      revenueTrend = ((revenues[revenues.length - 1] - revenues[0]) / revenues[0]) * 100;
      orderTrend = ((orders[orders.length - 1] - orders[0]) / orders[0]) * 100;
    }

    // Predict next month
    const predictedRevenue = avgRevenue * (1 + revenueTrend / 100);
    const predictedOrders = Math.round(avgOrders * (1 + orderTrend / 100));

    res.json({
      success: true,
      data: {
        historical: historicalData.rows.map(row => ({
          month: row.month,
          revenue: parseFloat(row.revenue),
          orders: parseInt(row.orders),
        })),
        prediction: {
          nextMonth: {
            revenue: Math.max(0, predictedRevenue),
            orders: Math.max(0, predictedOrders),
          },
          trends: {
            revenue: isNaN(revenueTrend) ? 0 : revenueTrend.toFixed(1),
            orders: isNaN(orderTrend) ? 0 : orderTrend.toFixed(1),
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching sales prediction:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sales prediction' });
  }
};
