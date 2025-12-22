import { z } from 'zod';

export const createOrderItemSchema = z.object({
  product_id: z.number().int().positive('Product ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unit_price: z.number().positive('Unit price must be positive'),
  item_discount: z.number().min(0).default(0),
});

export const createOrderSchema = z.object({
  customer_id: z.number().int().positive('Customer ID must be a positive integer'),
  order_source: z.string().default('OFFLINE'),
  order_status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED']).default('PENDING'),
  payment_method_id: z.number().int().positive('Payment method ID is required'),
  shipping_amount: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  items: z.array(createOrderItemSchema).min(1, 'At least one order item is required'),
});

export const updateOrderSchema = z.object({
  order_status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED']).optional(),
  shipping_amount: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
