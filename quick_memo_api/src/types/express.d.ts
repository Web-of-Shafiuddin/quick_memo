import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      adminId?: number;
      subscriptionLimits?: {
        max_categories: number;
        max_products: number;
        max_orders_per_month: number;
        can_upload_images: boolean;
      };
    }
  }
}
