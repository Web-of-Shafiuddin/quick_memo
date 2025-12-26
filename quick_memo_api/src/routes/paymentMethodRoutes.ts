import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getPaymentMethods,
  getActivePaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
} from "../controllers/paymentMethodController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all payment methods (system defaults + user custom)
router.get("/", getPaymentMethods);

// Get active payment methods only (for dropdowns in order forms)
router.get("/active", getActivePaymentMethods);

// Create a new custom payment method
router.post("/", createPaymentMethod);

// Update a payment method (user's own only)
router.put("/:id", updatePaymentMethod);

// Toggle active status
router.patch("/:id/toggle", togglePaymentMethodStatus);

// Delete a payment method (soft delete, user's own only)
router.delete("/:id", deletePaymentMethod);

export default router;
