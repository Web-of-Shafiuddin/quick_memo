import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["quick_memo_user_token"];
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized, Token not found" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;
    req.userId = decoded.user_id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Unauthorized, Invalid token" });
  }
};

export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["quick_memo_admin_token"];
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized, Admin token not found" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden, Admin access required" });
    }

    req.adminId = decoded.admin_id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Unauthorized, Invalid admin token" });
  }
};
