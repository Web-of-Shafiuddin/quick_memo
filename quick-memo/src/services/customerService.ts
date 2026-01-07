import api from "@/lib/api";

export interface Customer {
  customer_id: number;
  user_id: number;
  name: string;
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
  order_count?: number;
  total_spent?: number;
}

export interface CreateCustomerInput {
  name: string;
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
}

export const customerService = {
  getAll: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const response = await api.get<{ success: boolean; data: Customer[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }>(
      "/customers",
      { params }
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Customer }>(
      `/customers/${id}`
    );
    return response.data;
  },

  create: async (data: CreateCustomerInput) => {
    const response = await api.post<{ success: boolean; data: Customer }>(
      "/customers",
      data
    );
    return response.data;
  },

  update: async (id: number, data: UpdateCustomerInput) => {
    const response = await api.put<{ success: boolean; data: Customer }>(
      `/customers/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/customers/${id}`
    );
    return response.data;
  },
};
