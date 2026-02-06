import api from "@/lib/api";

export interface Category {
  category_id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  product_count?: number;
  parent_category_id?: number | null;
  parent_category_name?: string;
  children_count?: number;
  children?: Category[];
}

export interface CreateCategoryInput {
  name: string;
  parent_category_id?: number | null;
}

export interface UpdateCategoryInput {
  name?: string;
  parent_category_id?: number | null;
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

  getChildren: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Category[] }>(
      `/categories/${id}/children`
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
