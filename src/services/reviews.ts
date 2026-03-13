import { api } from './api';
export interface CustomerReview {
    id: string;
    name: string;
    role?: string | null;
    review: string;
    rating: number;
    avatar?: string | null;
    phoneNumber?: string | null;
    createdAt: string;
}
export const reviewsService = {
    getAll: async () => {
        const res = await api.get<any>('/reviews');
        return (res.data ? res.data : res) as CustomerReview[];
    },
    create: async (data: Omit<CustomerReview, 'id' | 'createdAt'>) => {
        const res = await api.post<any>('/reviews', data);
        return (res.data ? res.data : res) as CustomerReview;
    },
};
