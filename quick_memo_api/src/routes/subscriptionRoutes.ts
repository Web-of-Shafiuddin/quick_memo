import { Router } from "express";
import { authMiddleware, adminAuthMiddleware } from "../middleware/authMiddleware.js";
import {
  getPlans,
  getUserSubscription,
  getUserRequests,
  submitRequest,
  activateFreePlan,
  getAllRequests,
  approveRequest,
  rejectRequest,
  getStats,
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} from "../controllers/subscriptionController.js";

const router = Router();

// Public routes
router.get('/plans', getPlans);

// User routes (requires user auth)
router.get('/my-subscription', authMiddleware, getUserSubscription);
router.get('/my-requests', authMiddleware, getUserRequests);
router.post('/request', authMiddleware, submitRequest);
router.post('/activate-free', authMiddleware, activateFreePlan);

// Admin routes (requires admin auth)
router.get('/admin/requests', adminAuthMiddleware, getAllRequests);
router.post('/admin/requests/:id/approve', adminAuthMiddleware, approveRequest);
router.post('/admin/requests/:id/reject', adminAuthMiddleware, rejectRequest);
router.get('/admin/stats', adminAuthMiddleware, getStats);

// Admin plan management routes
router.get('/admin/plans', adminAuthMiddleware, getAllPlans);
router.get('/admin/plans/:id', adminAuthMiddleware, getPlanById);
router.post('/admin/plans', adminAuthMiddleware, createPlan);
router.put('/admin/plans/:id', adminAuthMiddleware, updatePlan);
router.delete('/admin/plans/:id', adminAuthMiddleware, deletePlan);

export default router;
