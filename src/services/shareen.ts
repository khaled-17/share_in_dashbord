import { api } from './api';
export interface ShareenItem {
    id: number;
    created_at: string;
}
export const shareenService = {
    getAll: async (): Promise<ShareenItem[]> => {
        const res = await api.get<any>('/shareen');
        return (res.data ? res.data : res) as ShareenItem[];
    },
    create: async (): Promise<ShareenItem> => {
        const res = await api.post<any>('/shareen', {});
        return (res.data ? res.data : res) as ShareenItem;
    }
};
