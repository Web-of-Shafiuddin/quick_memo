import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import memoRoutes from "./routes/memoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import pool from "./config/database.js";
import cookieParser from "cookie-parser";
import { startSubscriptionScheduler } from "./services/subscriptionScheduler.js";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Quick Memo API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/memos", memoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Subscription scheduler interval
let schedulerInterval: NodeJS.Timeout | null = null;

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\nShutting down gracefully...");
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }
  await pool.end();
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);

  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully");

    // Start subscription scheduler (runs every hour)
    schedulerInterval = startSubscriptionScheduler(60 * 60 * 1000);
    console.log("📅 Subscription scheduler started");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});

export default app;
