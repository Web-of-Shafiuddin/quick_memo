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
