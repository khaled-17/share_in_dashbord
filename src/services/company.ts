import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface CompanySettings {
    id: number;
    name: string;
    description?: string | null;
    about?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    updated_at: string;
}

export const companyService = {
    getSettings: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data as CompanySettings;
        }
        return api.get<CompanySettings>('/company');
    },

    updateSettings: async (data: Partial<CompanySettings>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('company_settings')
                .upsert({ id: 1, ...data }) // Using id 1 for single settings row
                .select()
                .single();
            if (error) throw error;
            return result as CompanySettings;
        }
        return api.put<CompanySettings>('/company', data);
    },
};
