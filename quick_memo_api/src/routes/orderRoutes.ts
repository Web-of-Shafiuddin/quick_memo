import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  getOrderStats,
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkOrderLimit } from '../middleware/subscriptionLimits.js';
import { validate } from '../middleware/validator.js';
import { createOrderSchema, updateOrderSchema } from '../schemas/orderSchema.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Order CRUD
router.get('/', getAllOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrderById);
router.post('/', checkOrderLimit, validate(createOrderSchema), createOrder);
router.put('/:id', validate(updateOrderSchema), updateOrder);
router.post('/:id/cancel', cancelOrder);

export default router;
