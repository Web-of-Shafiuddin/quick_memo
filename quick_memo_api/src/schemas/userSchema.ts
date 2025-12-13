import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address").toLowerCase(),
    mobile: z
      .string()
      .min(11, "Mobile number must be at least 11 characters long")
      .or(z.literal('')) // Allow an empty string
      .transform((value) => value === '' ? null : value)  // Transform empty string to null
      .optional()
      .nullable(),  // Allows the final result to be null
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});