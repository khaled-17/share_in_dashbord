import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface Supplier {
    id: number;
    supplier_id: string;
    name: string; // Company Name
    contact_person?: string | null;
    email?: string | null;
    phone?: string | null;
    secondary_phone?: string | null;
    address?: string | null;
    speciality?: string | null;
    created_at?: string;
    expenses?: any[];
}

export const supplierService = {
    getAll: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            return data as Supplier[];
        }
        const res = await api.get<any>('/suppliers');
        return (res.data ? res.data : res) as Supplier[];
    },

    getById: async (id: string) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('suppliers')
                .select(`
                    *,
                    expenses(*, type:expense_types(*)),
                    payment_vouchers(*)
                `)
                .eq('supplier_id', id)
                .single();
            if (error) throw error;
            return data as Supplier;
        }
        const res = await api.get<any>(`/suppliers/${id}`);
        return (res.data ? res.data : res) as Supplier;
    },

    create: async (data: Omit<Supplier, 'id' | 'created_at'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('suppliers')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as Supplier;
        }
        const res = await api.post<any>('/suppliers', data);
        return (res.data ? res.data : res) as Supplier;
    },

    update: async (id: number, data: Partial<Supplier>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('suppliers')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result as Supplier;
        }
        const res = await api.put<any>(`/suppliers/${id}`, data);
        return (res.data ? res.data : res) as Supplier;
    },

    delete: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { message: 'Supplier deleted successfully' };
        }
        const res = await api.delete<any>(`/suppliers/${id}`);
        return res;
    },
};
