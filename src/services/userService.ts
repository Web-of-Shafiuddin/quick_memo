import api from "@/lib/api";
import { User } from "@/types/User";

export const userService = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: User[] }>(
      "/users"
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: User }>(
      `/users/${id}`
    );
    return response.data;
  },

  update: async (
    id: string,
    data: {
      email?: string;
      name?: string;
      mobile?: string;
      preferred_currency?: string;
      shop_name?: string;
      shop_owner_name?: string;
      shop_mobile?: string;
      shop_email?: string;
      shop_address?: string;
      shop_logo_url?: string;
      shop_slug?: string;
      shop_description?: string | null;
      nid_license_url?: string | null;
      verification_images?: string[];
      social_links?: any;
    }
  ) => {
    const response = await api.put<{ success: boolean; data: User }>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/users/${id}`
    );
    return response.data;
  },
};
