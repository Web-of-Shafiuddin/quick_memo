import api from '@/lib/api';

export interface User {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    updatedAt: string;
}

export const userService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: User[] }>('/users');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
        return response.data;
    },

    create: async (data: {email: string, name: string, password: string, mobile?: string}) => {
        const registerPayload = Object.fromEntries(Object.entries(data).filter(([_, value]) => !!value));

        const response = await api.post<{ success: boolean; data: User }>('/users', registerPayload);
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
