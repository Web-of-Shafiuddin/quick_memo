import express from "express";
import {
  getShopBySlug,
  getShopProducts,
  getShopProductBySku,
  createPublicOrder,
  reportShop,
  submitReview,
  getShopReviews,
} from "../controllers/publicShopController.js";

const router = express.Router();

// Public routes (no auth required)
router.get("/:slug", getShopBySlug);
router.get("/:slug/products", getShopProducts);
router.get("/:slug/products/:sku", getShopProductBySku);
router.get("/:slug/reviews", getShopReviews);
router.post("/:slug/orders", createPublicOrder);
router.post("/:slug/report", reportShop);
router.post("/:slug/review", submitReview);

export default router;
