import api from "@/lib/api";

export interface OrderItem {
  order_item_id: number;
  transaction_id: number;
  product_id: number;
  name_snapshot: string;
  quantity: number;
  unit_price: number;
  item_discount: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  product_name?: string;
  product_sku?: string;
  product_image?: string;
}

export interface Order {
  transaction_id: number;
  user_id: number;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  customer_mobile?: string;
  customer_address?: string;
  order_date: string;
  order_source: string;
  order_status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  payment_method_id: number;
  payment_method_name?: string;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CreateOrderItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
  item_discount?: number;
}

export interface CreateOrderInput {
  customer_id: number;
  order_source?: string;
  order_status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  payment_method_id: number;
  shipping_amount?: number;
  tax_amount?: number;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderInput {
  order_status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  shipping_amount?: number;
  tax_amount?: number;
}

export interface OrderStats {
  total_orders: number;
  total_customers: number;
  total_revenue: number;
  average_order_value: number;
  pending_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
}

export type OrderListParams = {
  status?: string;
  customer_id?: number;
  start_date?: string;
  end_date?: string;
  order_source?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

export const orderService = {
  getAll: async (params?: OrderListParams) => {
    const response = await api.get<{ success: boolean; data: Order[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }>(
      "/orders",
      { params }
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Order }>(
      `/orders/${id}`
    );
    return response.data;
  },

  create: async (data: CreateOrderInput) => {
    const response = await api.post<{ success: boolean; data: Order }>(
      "/orders",
      data
    );
    return response.data;
  },

  update: async (id: number, data: UpdateOrderInput) => {
    const response = await api.put<{ success: boolean; data: Order }>(
      `/orders/${id}`,
      data
    );
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await api.post<{ success: boolean; data: Order }>(
      `/orders/${id}/cancel`
    );
    return response.data;
  },

  getStats: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get<{ success: boolean; data: OrderStats }>(
      "/orders/stats",
      { params }
    );
    return response.data;
  },
};
