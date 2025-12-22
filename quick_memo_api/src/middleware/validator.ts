import { ZodObject } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
  // Check if schema expects a 'body' wrapper (legacy schemas)
  // by attempting to parse with the wrapper first
  let result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  // If that fails, try parsing req.body directly (new schemas)
  if (!result.success) {
    result = schema.safeParse(req.body);
  }

  if (result.success) {
    next();
  } else {
    return res.status(400).json({ success: false, error: "Validation failed", detailedError: result.error });
  }
};
