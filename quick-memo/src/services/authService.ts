import api from "@/lib/api";
import { User } from "@/types/User";

export const authService = {
        userRegister: async (data: {email: string, name: string, password: string, mobile?: string}) => {
        const registerPayload = Object.fromEntries(Object.entries(data).filter(([_, value]) => !!value));

        const response = await api.post<{ success: boolean; data: User }>('/auth/register', registerPayload);
        return response.data;
    },
}