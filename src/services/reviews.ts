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
    getAll: () => api.get<CustomerReview[]>('/reviews'),

    create: (data: Omit<CustomerReview, 'id' | 'createdAt'>) => api.post<CustomerReview>('/reviews', data),
};
