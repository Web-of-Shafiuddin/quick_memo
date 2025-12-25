import { Router } from "express";
import { authMiddleware, adminAuthMiddleware } from "../middleware/authMiddleware.js";
import {
  getPlans,
  getUserSubscription,
  getUserRequests,
  submitRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  getStats
} from "../controllers/subscriptionController.js";

const router = Router();

// Public routes
router.get('/plans', getPlans);

// User routes (requires user auth)
router.get('/my-subscription', authMiddleware, getUserSubscription);
router.get('/my-requests', authMiddleware, getUserRequests);
router.post('/request', authMiddleware, submitRequest);

// Admin routes (requires admin auth)
router.get('/admin/requests', adminAuthMiddleware, getAllRequests);
router.post('/admin/requests/:id/approve', adminAuthMiddleware, approveRequest);
router.post('/admin/requests/:id/reject', adminAuthMiddleware, rejectRequest);
router.get('/admin/stats', adminAuthMiddleware, getStats);

export default router;
