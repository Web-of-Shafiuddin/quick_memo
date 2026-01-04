import { Router } from "express";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  setUserSubscription,
  cancelUserSubscription,
  getDashboardStats,
  getReports,
  getReviews,
  deleteReview,
} from "../controllers/adminController.js";

const router = Router();

// All routes require admin auth
router.use(adminAuthMiddleware);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// User subscription management
router.post("/users/:id/subscription", setUserSubscription);
router.delete("/users/:id/subscription", cancelUserSubscription);

// Moderation
router.get("/reports", getReports);
router.get("/reviews", getReviews);
router.delete("/reviews/:id", deleteReview);

export default router;
