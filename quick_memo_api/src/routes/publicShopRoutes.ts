import express from "express";
import {
  getShopBySlug,
  getShopProducts,
  getShopProductBySku,
  createPublicOrder,
} from "../controllers/publicShopController.js";

const router = express.Router();

// Public routes (no auth required)
router.get("/:slug", getShopBySlug);
router.get("/:slug/products", getShopProducts);
router.get("/:slug/products/:sku", getShopProductBySku);
router.post("/:slug/orders", createPublicOrder);

export default router;
