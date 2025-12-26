import { Request, Response, NextFunction } from "express";
import pool from "../config/database.js";

interface SubscriptionLimits {
  max_categories: number;
  max_products: number;
  max_orders_per_month: number;
  can_upload_images: boolean;
}

interface SubscriptionInfo {
  limits: SubscriptionLimits;
  status: string;
  end_date: Date;
  grace_period_end: Date | null;
  is_in_grace_period: boolean;
  days_remaining: number;
}

interface UserCounts {
  product_count: number;
  category_count: number;
  monthly_order_count: number;
}

// Helper function to get user's subscription info including grace period
const getUserSubscriptionInfo = async (userId: number): Promise<SubscriptionInfo | null> => {
  const result = await pool.query(
    `SELECT
       sp.max_categories, sp.max_products, sp.max_orders_per_month, sp.can_upload_images,
       s.status, s.end_date, s.grace_period_end,
       CASE
         WHEN s.status = 'GRACE_PERIOD' AND s.grace_period_end > NOW() THEN true
         ELSE false
       END as is_in_grace_period,
       CASE
         WHEN s.status = 'ACTIVE' AND s.end_date > NOW() THEN
           EXTRACT(DAY FROM (s.end_date - NOW()))::int
         WHEN s.status = 'GRACE_PERIOD' AND s.grace_period_end > NOW() THEN
           EXTRACT(DAY FROM (s.grace_period_end - NOW()))::int
         ELSE 0
       END as days_remaining
     FROM subscriptions s
     JOIN subscription_plans sp ON s.plan_id = sp.plan_id
     WHERE s.user_id = $1
       AND (
         (s.status = 'ACTIVE' AND s.end_date > NOW())
         OR (s.status = 'GRACE_PERIOD' AND s.grace_period_end > NOW())
       )`,
    [userId]
  );

  if (!result.rows[0]) return null;

  const row = result.rows[0];
  return {
    limits: {
      max_categories: row.max_categories,
      max_products: row.max_products,
      max_orders_per_month: row.max_orders_per_month,
      can_upload_images: row.can_upload_images
    },
    status: row.status,
    end_date: row.end_date,
    grace_period_end: row.grace_period_end,
    is_in_grace_period: row.is_in_grace_period,
    days_remaining: row.days_remaining
  };
};

// Legacy helper for backward compatibility
const getUserSubscriptionLimits = async (userId: number): Promise<SubscriptionLimits | null> => {
  const info = await getUserSubscriptionInfo(userId);
  return info?.limits || null;
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

    const subscriptionInfo = await getUserSubscriptionInfo(userId);
    const counts = await getUserCounts(userId);

    if (!subscriptionInfo) {
      return res.json({
        success: true,
        data: {
          hasActiveSubscription: false,
          isInGracePeriod: false,
          limits: null,
          usage: counts
        }
      });
    }

    const { limits } = subscriptionInfo;

    res.json({
      success: true,
      data: {
        hasActiveSubscription: true,
        isInGracePeriod: subscriptionInfo.is_in_grace_period,
        status: subscriptionInfo.status,
        endDate: subscriptionInfo.end_date,
        gracePeriodEnd: subscriptionInfo.grace_period_end,
        daysRemaining: subscriptionInfo.days_remaining,
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
