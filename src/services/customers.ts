import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface Customer {
    customer_id: string;
    name: string;
    contact_person: string;
    company_email: string;
    contact_email: string;
    phone: string;
    secondary_phone: string;
    address: string;
    created_at?: string;
    revenues?: any[];
    quotations?: any[];
    work_orders?: any[];
}

export interface PaginatedResponse<T> {
    success?: boolean;
    data: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const customerService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        if (APP_CONFIG.currentSource === 'supabase') {
            let query = supabase.from('customers').select('*', { count: 'exact' });
            if (params?.search) {
                query = query.or(`name.ilike.%${params.search}%,customer_id.ilike.%${params.search}%,phone.ilike.%${params.search}%,contact_person.ilike.%${params.search}%`);
            }
            query = query.order('name', { ascending: true });

            if (params?.page && params?.limit) {
                const from = (params.page - 1) * params.limit;
                const to = from + params.limit - 1;
                query = query.range(from, to);
            }

            const { data, error, count } = await query;
            if (error) throw error;
            return {
                data: (data || []) as Customer[],
                pagination: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / (params?.limit || 10))
                }
            } as PaginatedResponse<Customer>;
        }

        const res = await api.get<any>(`/customers${queryString}`);
        // Support both wrapped API format and raw array format just in case
        if (res && res.data && Array.isArray(res.data)) {
            return res as PaginatedResponse<Customer>;
        } else if (Array.isArray(res)) {
            return { data: res } as PaginatedResponse<Customer>;
        }
        return { data: [] } as PaginatedResponse<Customer>;
    },

    getById: async (id: string) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    *,
                    revenues:revenue(*, type:revenue_types(*)),
                    quotations(*),
                    work_orders:WorkOrder(*)
                `)
                .eq('customer_id', id)
                .single();
            if (error) throw error;
            return data as Customer;
        }
        const res = await api.get<any>(`/customers/${id}`);
        return (res.data ? res.data : res) as Customer;
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
        const res = await api.post<any>('/customers', data);
        return (res.data ? res.data : res) as Customer;
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
        const res = await api.put<any>(`/customers/${id}`, data);
        return (res.data ? res.data : res) as Customer;
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
        const res = await api.delete<any>(`/customers/${id}`);
        return res;
    }
};
