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
        const res = await api.get<any>('/shareen');
        return (res.data ? res.data : res) as ShareenItem[];
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
        const res = await api.post<any>('/shareen', {});
        return (res.data ? res.data : res) as ShareenItem;
    }
};
