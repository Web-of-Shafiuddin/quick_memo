import { Request, Response, NextFunction } from "express";
import pool from "../config/database.js";

interface SubscriptionLimits {
  max_categories: number;
  max_products: number;
  max_orders_per_month: number;
  can_upload_images: boolean;
}

interface UserCounts {
  product_count: number;
  category_count: number;
  monthly_order_count: number;
}

// Helper function to get user's subscription limits
const getUserSubscriptionLimits = async (userId: number): Promise<SubscriptionLimits | null> => {
  const result = await pool.query(
    `SELECT sp.max_categories, sp.max_products, sp.max_orders_per_month, sp.can_upload_images
     FROM subscriptions s
     JOIN subscription_plans sp ON s.plan_id = sp.plan_id
     WHERE s.user_id = $1 AND s.status = 'ACTIVE' AND s.end_date > NOW()`,
    [userId]
  );

  return result.rows[0] || null;
};

// Helper function to get user's current counts
const getUserCounts = async (userId: number): Promise<UserCounts> => {
  const result = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM products WHERE user_id = $1) as product_count,
      (SELECT COUNT(*) FROM categories WHERE user_id = $1) as category_count,
      (SELECT COUNT(*) FROM order_headers WHERE user_id = $1
       AND order_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_order_count`,
    [userId]
  );

  return {
    product_count: parseInt(result.rows[0].product_count) || 0,
    category_count: parseInt(result.rows[0].category_count) || 0,
    monthly_order_count: parseInt(result.rows[0].monthly_order_count) || 0,
  };
};

// Middleware to check if user has an active subscription
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const limits = await getUserSubscriptionLimits(userId);

    if (!limits) {
      return res.status(403).json({
        success: false,
        error: "No active subscription. Please subscribe to a plan to continue.",
        code: "NO_SUBSCRIPTION"
      });
    }

    // Attach limits to request for use in subsequent middleware/controllers
    req.subscriptionLimits = limits;
    next();
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ success: false, error: "Failed to verify subscription" });
  }
};

// Middleware to check product creation limit
export const checkProductLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const limits = await getUserSubscriptionLimits(userId);

    if (!limits) {
      return res.status(403).json({
        success: false,
        error: "No active subscription. Please subscribe to a plan to add products.",
        code: "NO_SUBSCRIPTION"
      });
    }

    // -1 means unlimited
    if (limits.max_products === -1) {
      req.subscriptionLimits = limits;
      return next();
    }

    const counts = await getUserCounts(userId);

    if (counts.product_count >= limits.max_products) {
      return res.status(403).json({
        success: false,
        error: `Product limit reached. Your plan allows maximum ${limits.max_products} products. Please upgrade your subscription.`,
        code: "PRODUCT_LIMIT_REACHED",
        limit: limits.max_products,
        current: counts.product_count
      });
    }

    req.subscriptionLimits = limits;
    next();
  } catch (error) {
    console.error("Error checking product limit:", error);
    res.status(500).json({ success: false, error: "Failed to verify product limit" });
  }
};

// Middleware to check category creation limit
export const checkCategoryLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const limits = await getUserSubscriptionLimits(userId);

    if (!limits) {
      return res.status(403).json({
        success: false,
        error: "No active subscription. Please subscribe to a plan to add categories.",
        code: "NO_SUBSCRIPTION"
      });
    }

    // -1 means unlimited
    if (limits.max_categories === -1) {
      req.subscriptionLimits = limits;
      return next();
    }

    const counts = await getUserCounts(userId);

    if (counts.category_count >= limits.max_categories) {
      return res.status(403).json({
        success: false,
        error: `Category limit reached. Your plan allows maximum ${limits.max_categories} categories. Please upgrade your subscription.`,
        code: "CATEGORY_LIMIT_REACHED",
        limit: limits.max_categories,
        current: counts.category_count
      });
    }

    req.subscriptionLimits = limits;
    next();
  } catch (error) {
    console.error("Error checking category limit:", error);
    res.status(500).json({ success: false, error: "Failed to verify category limit" });
  }
};

// Middleware to check monthly order limit
export const checkOrderLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const limits = await getUserSubscriptionLimits(userId);

    if (!limits) {
      return res.status(403).json({
        success: false,
        error: "No active subscription. Please subscribe to a plan to create orders.",
        code: "NO_SUBSCRIPTION"
      });
    }

    // -1 means unlimited
    if (limits.max_orders_per_month === -1) {
      req.subscriptionLimits = limits;
      return next();
    }

    const counts = await getUserCounts(userId);

    if (counts.monthly_order_count >= limits.max_orders_per_month) {
      return res.status(403).json({
        success: false,
        error: `Monthly order limit reached. Your plan allows maximum ${limits.max_orders_per_month} orders per month. Please upgrade your subscription.`,
        code: "ORDER_LIMIT_REACHED",
        limit: limits.max_orders_per_month,
        current: counts.monthly_order_count
      });
    }

    req.subscriptionLimits = limits;
    next();
  } catch (error) {
    console.error("Error checking order limit:", error);
    res.status(500).json({ success: false, error: "Failed to verify order limit" });
  }
};

// Middleware to check image upload permission
export const checkImageUploadPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const limits = await getUserSubscriptionLimits(userId);

    if (!limits) {
      return res.status(403).json({
        success: false,
        error: "No active subscription. Please subscribe to a plan to upload images.",
        code: "NO_SUBSCRIPTION"
      });
    }

    if (!limits.can_upload_images) {
      return res.status(403).json({
        success: false,
        error: "Image upload is not available on your current plan. Please upgrade to upload images.",
        code: "IMAGE_UPLOAD_NOT_ALLOWED"
      });
    }

    req.subscriptionLimits = limits;
    next();
  } catch (error) {
    console.error("Error checking image upload permission:", error);
    res.status(500).json({ success: false, error: "Failed to verify image upload permission" });
  }
};

// Helper to get subscription status and limits for frontend display
export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const limits = await getUserSubscriptionLimits(userId);
    const counts = await getUserCounts(userId);

    if (!limits) {
      return res.json({
        success: true,
        data: {
          hasActiveSubscription: false,
          limits: null,
          usage: counts
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasActiveSubscription: true,
        limits,
        usage: counts,
        remaining: {
          products: limits.max_products === -1 ? -1 : Math.max(0, limits.max_products - counts.product_count),
          categories: limits.max_categories === -1 ? -1 : Math.max(0, limits.max_categories - counts.category_count),
          orders_this_month: limits.max_orders_per_month === -1 ? -1 : Math.max(0, limits.max_orders_per_month - counts.monthly_order_count)
        }
      }
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({ success: false, error: "Failed to get subscription status" });
  }
};
