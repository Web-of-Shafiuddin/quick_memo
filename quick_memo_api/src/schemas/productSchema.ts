import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1).optional(), // SKU is optional, will be auto-generated if not provided
  name: z.string().min(1, 'Product name is required'),
  category_id: z.number().int().positive('Category ID must be a positive integer'),
  price: z.number().positive('Price must be a positive number'),
  discount: z.number().min(0).max(100).default(0),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
  image: z.string().url().optional().nullable(),
  parent_product_id: z.number().int().positive().optional().nullable(),
});

export const updateProductSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  category_id: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
  image: z.string().url().optional().nullable(),
  parent_product_id: z.number().int().positive().optional().nullable(),
});

export const createVariantAttributeSchema = z.object({
  attribute_name: z.string().min(1, 'Attribute name is required'),
  attribute_value: z.string().min(1, 'Attribute value is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantAttributeInput = z.infer<typeof createVariantAttributeSchema>;
