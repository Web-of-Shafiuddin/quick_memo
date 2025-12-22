import api from "@/lib/api";

// API response types (what comes from the server)
interface ProductFromAPI {
  product_id: number;
  user_id: number;
  sku: string;
  name: string;
  category_id: number;
  category_name?: string;
  price: string; // PostgreSQL returns NUMERIC as string
  discount: string; // PostgreSQL returns REAL as string
  stock: string; // PostgreSQL returns INT as string in some cases
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  image?: string | null;
  parent_product_id?: number | null;
  created_at: string;
  updated_at: string;
  variants?: ProductFromAPI[];
  attributes?: VariantAttribute[];
}

// Client-side types (what we use in the app)
export interface Product {
  product_id: number;
  user_id: number;
  sku: string;
  name: string;
  category_id: number;
  category_name?: string;
  price: number;
  discount: number;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  image?: string | null;
  parent_product_id?: number | null;
  created_at: string;
  updated_at: string;
  variants?: Product[];
  attributes?: VariantAttribute[];
}

export interface VariantAttribute {
  attribute_id: number;
  product_id: number;
  attribute_name: string;
  attribute_value: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  category_id: number;
  price: number;
  discount?: number;
  stock?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  image?: string | null;
  parent_product_id?: number | null;
}

export interface UpdateProductInput {
  sku?: string;
  name?: string;
  category_id?: number;
  price?: number;
  discount?: number;
  stock?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  image?: string | null;
  parent_product_id?: number | null;
}

// Helper function to transform product data from API
const transformProduct = (product: ProductFromAPI): Product => ({
  ...product,
  price: parseFloat(product.price),
  discount: parseFloat(product.discount),
  stock: parseInt(product.stock, 10),
  variants: product.variants?.map(transformProduct),
});

export const productService = {
  getAll: async (params?: {
    category_id?: number;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get<{ success: boolean; data: ProductFromAPI[] }>(
      "/products",
      { params }
    );
    return {
      ...response.data,
      data: response.data.data.map(transformProduct),
    };
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: ProductFromAPI }>(
      `/products/${id}`
    );
    return {
      ...response.data,
      data: transformProduct(response.data.data),
    };
  },

  getBySku: async (sku: string) => {
    const response = await api.get<{ success: boolean; data: ProductFromAPI }>(
      `/products/sku/${sku}`
    );
    return {
      ...response.data,
      data: transformProduct(response.data.data),
    };
  },

  create: async (data: CreateProductInput) => {
    const response = await api.post<{ success: boolean; data: ProductFromAPI }>(
      "/products",
      data
    );
    return {
      ...response.data,
      data: transformProduct(response.data.data),
    };
  },

  update: async (id: number, data: UpdateProductInput) => {
    const response = await api.put<{ success: boolean; data: ProductFromAPI }>(
      `/products/${id}`,
      data
    );
    return {
      ...response.data,
      data: transformProduct(response.data.data),
    };
  },

  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/products/${id}`
    );
    return response.data;
  },

  updateStock: async (id: number, stock: number) => {
    const response = await api.patch<{ success: boolean; data: Product }>(
      `/products/${id}/stock`,
      { stock }
    );
    return response.data;
  },

  addVariantAttribute: async (
    id: number,
    data: { attribute_name: string; attribute_value: string }
  ) => {
    const response = await api.post<{
      success: boolean;
      data: VariantAttribute;
    }>(`/products/${id}/attributes`, data);
    return response.data;
  },
};
