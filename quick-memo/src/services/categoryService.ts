import api from "@/lib/api";

export interface Category {
  category_id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
}

export const categoryService = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: Category[] }>(
      "/categories"
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Category }>(
      `/categories/${id}`
    );
    return response.data;
  },

  create: async (data: CreateCategoryInput) => {
    const response = await api.post<{ success: boolean; data: Category }>(
      "/categories",
      data
    );
    return response.data;
  },

  update: async (id: number, data: UpdateCategoryInput) => {
    const response = await api.put<{ success: boolean; data: Category }>(
      `/categories/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/categories/${id}`
    );
    return response.data;
  },
};
