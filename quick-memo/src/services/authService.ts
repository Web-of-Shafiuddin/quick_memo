import api from "@/lib/api";
import { User } from "@/types/User";

export const authService = {
  userRegister: async (data: {
    email: string;
    name: string;
    password: string;
    mobile?: string;
  }) => {
    const registerPayload = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => !!value)
    );

    const response = await api.post<{ success: boolean; data: User }>(
      "/auth/register",
      registerPayload
    );
    return response.data;
  },
  userLogin: async (data: { email: string; password: string }) => {
    const response = await api.post<{ success: boolean; data: User }>(
      "/auth/login",
      data
    );
    return response.data;
  },
  validateSession: async () => {
    const response = await api.get<{ success: boolean; data: User }>(
      "/auth/validate-token"
    );
    return response.data;
  },
};
