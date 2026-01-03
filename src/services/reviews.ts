import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

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
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('CustomerReview')
                .select('*')
                .order('createdAt', { ascending: false });
            if (error) throw error;
            return data as CustomerReview[];
        }
        return api.get<CustomerReview[]>('/reviews');
    },

    create: async (data: Omit<CustomerReview, 'id' | 'createdAt'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('CustomerReview')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as CustomerReview;
        }
        return api.post<CustomerReview>('/reviews', data);
    },
};
