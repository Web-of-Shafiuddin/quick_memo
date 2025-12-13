import { ZodObject } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });
  if (result.success) {
    next();
  } else {
    return res.status(400).json({ success: false, error: "Validation failed", detailedError: result.error });
  }
};
