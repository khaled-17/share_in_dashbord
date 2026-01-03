import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface Customer {
    customer_id: string;
    name: string;
    contact_person?: string | null;
    company_email?: string | null;
    contact_email?: string | null;
    phone?: string | null;
    secondary_phone?: string | null;
    address?: string | null;
    created_at?: string;
    revenues?: any[];
    quotations?: any[];
    work_orders?: any[];
}

export const customerService = {
    getAll: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            return data as Customer[];
        }
        return api.get<Customer[]>('/customers');
    },

    getById: async (id: string) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    revenues(*, type:revenue_types(*)),
                    quotations(*),
                    work_orders(*)
                `)
                .eq('customer_id', id)
                .single();
            if (error) throw error;
            return data as Customer;
        }
        return api.get<Customer>(`/customers/${id}`);
    },

    create: async (data: Customer) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('customers')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as Customer;
        }
        return api.post<Customer>('/customers', data);
    },

    update: async (id: string, data: Partial<Customer>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('customers')
                .update(data)
                .eq('customer_id', id)
                .select()
                .single();
            if (error) throw error;
            return result as Customer;
        }
        return api.put<Customer>(`/customers/${id}`, data);
    },

    delete: async (id: string) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('customer_id', id);
            if (error) throw error;
            return { message: 'Customer deleted successfully' };
        }
        return api.delete<{ message: string }>(`/customers/${id}`);
    },
};
