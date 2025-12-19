import { api } from './api';

export interface ShareenItem {
    id: number;
    created_at: string;
}

export const shareenService = {
    getAll: async (): Promise<ShareenItem[]> => {
        return api.get<ShareenItem[]>('/shareen');
    },

    // Optional create if needed
    create: async (): Promise<ShareenItem> => {
        return api.post<ShareenItem>('/shareen', {});
    }
};
