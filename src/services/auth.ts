import { api } from './api';

export interface User {
    id: number;
    email: string;
    name?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        return api.post<AuthResponse>('/auth/login', { email, password });
    },

    register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
        return api.post<AuthResponse>('/auth/register', { email, password, name });
    },

    refreshToken: async (token: string): Promise<{ accessToken: string; refreshToken: string }> => {
        const res = await api.post<any>('/auth/refresh', { refreshToken: token });
        return res.data;
    },
};
