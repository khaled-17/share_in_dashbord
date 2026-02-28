import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface Partner {
    id: number;
    partner_code: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    initial_capital: number;
    current_capital: number;
    created_at: string;
    receipt_vouchers?: any[];
    payment_vouchers?: any[];
}

export interface PartnerSummary {
    partner_code: string;
    name: string;
    initial_capital: number;
    current_capital: number;
    total_capital_increase: number;
    total_withdrawals: number;
    net_capital: number;
}

export const partnerService = {
    getAll: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            return data as Partner[];
        }
        const res = await api.get<any>('/partners');
        return (res.data ? res.data : res) as Partner[];
    },

    getById: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('partners')
                .select(`
                    *,
                    receipt_vouchers(*),
                    payment_vouchers(*)
                `)
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as Partner;
        }
        const res = await api.get<any>(`/partners/${id}`);
        return (res.data ? res.data : res) as Partner;
    },

    getSummary: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('partners')
                .select(`
                    partner_code,
                    name,
                    initial_capital,
                    current_capital,
                    receipt_vouchers(amount),
                    payment_vouchers(amount)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            const totalIncreases = (data.receipt_vouchers as any[]).reduce((sum, v) => sum + v.amount, 0);
            const totalWithdrawals = (data.payment_vouchers as any[]).reduce((sum, v) => sum + v.amount, 0);

            return {
                partner_code: data.partner_code,
                name: data.name,
                initial_capital: data.initial_capital,
                current_capital: data.current_capital,
                total_capital_increase: totalIncreases,
                total_withdrawals: totalWithdrawals,
                net_capital: data.initial_capital + totalIncreases - totalWithdrawals
            } as PartnerSummary;
        }
        const res = await api.get<any>(`/partners/${id}/summary`);
        return (res.data ? res.data : res) as PartnerSummary;
    },

    create: async (data: Omit<Partner, 'id' | 'current_capital' | 'created_at'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('partners')
                .insert([{ ...data, current_capital: data.initial_capital }])
                .select()
                .single();
            if (error) throw error;
            return result as Partner;
        }
        const res = await api.post<any>('/partners', data);
        return (res.data ? res.data : res) as Partner;
    },

    update: async (id: number, data: Partial<Pick<Partner, 'name' | 'phone' | 'email'>>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('partners')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result as Partner;
        }
        const res = await api.put<any>(`/partners/${id}`, data);
        return (res.data ? res.data : res) as Partner;
    },

    delete: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('partners').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Partner deleted successfully' };
        }
        const res = await api.delete<any>(`/partners/${id}`);
        return res;
    },
};
