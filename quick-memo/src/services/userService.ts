import api from '@/lib/api';
import { User } from '@/types/User';

export const userService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: User[] }>('/users');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
        return response.data;
    },

    update: async (id: string, data: { email?: string; name?: string }) => {
        const response = await api.put<{ success: boolean; data: User }>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
        return response.data;
    },
};
