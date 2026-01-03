import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface ShareenItem {
    id: number;
    created_at: string;
}

export const shareenService = {
    getAll: async (): Promise<ShareenItem[]> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('shareen')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as ShareenItem[];
        }
        return api.get<ShareenItem[]>('/shareen');
    },

    create: async (): Promise<ShareenItem> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('shareen')
                .insert([{}])
                .select()
                .single();
            if (error) throw error;
            return result as ShareenItem;
        }
        return api.post<ShareenItem>('/shareen', {});
    }
};
