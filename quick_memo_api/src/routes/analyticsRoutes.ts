import { Router } from 'express';
import {
  getDashboardStats,
  getSalesOverTime,
  getTopProducts,
  getTopCustomers,
  getSalesByCategory,
  getSalesBySource,
  getOrderStatusDistribution,
  getRecentOrders,
  getLowStockProducts,
  getMonthlyRevenue,
  getSalesPrediction,
} from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

// Dashboard overview
router.get('/dashboard', getDashboardStats);

// Sales analytics
router.get('/sales/over-time', getSalesOverTime);
router.get('/sales/by-category', getSalesByCategory);
router.get('/sales/by-source', getSalesBySource);
router.get('/sales/monthly', getMonthlyRevenue);
router.get('/sales/prediction', getSalesPrediction);

// Product analytics
router.get('/products/top', getTopProducts);
router.get('/products/low-stock', getLowStockProducts);

// Customer analytics
router.get('/customers/top', getTopCustomers);

// Order analytics
router.get('/orders/status-distribution', getOrderStatusDistribution);
router.get('/orders/recent', getRecentOrders);

export default router;
