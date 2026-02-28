import { api } from './api';
import type { Customer } from './customers';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface QuotationItem {
    id?: number;
    description: string;
    unit_price: number;
    quantity: number;
    total: number;
}

export interface ProjectType {
    id: number;
    type_id: string;
    type_name: string;
}

export interface Quotation {
    id: number;
    customer_id: string;
    project_type_id?: string | null;
    project_manager?: string | null;
    project_name?: string | null;
    quote_date: string;
    delivery_date?: string | null;
    totalamount: number;
    paid_adv?: number | null;
    adv_date?: string | null;
    receipt_no?: string | null;
    status: string;
    customer?: Customer;
    project_type?: ProjectType;
    items?: QuotationItem[];
}

export const quotationService = {
    getAll: async (): Promise<Quotation[]> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('quotations')
                .select('*, customer:customers(name)')
                .order('quote_date', { ascending: false });
            if (error) throw error;
            return data as Quotation[];
        }
        const res = await api.get<any>('/quotations');
        return (res.data ? res.data : res) as Quotation[];
    },

    getById: async (id: number): Promise<Quotation> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('quotations')
                .select(`
                    *,
                    customer:customers(*),
                    project_type:project_types(*),
                    items:quotation_items(*)
                `)
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as Quotation;
        }
        const res = await api.get<any>(`/quotations/${id}`);
        return (res.data ? res.data : res) as Quotation;
    },

    create: async (data: Partial<Quotation>): Promise<Quotation> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            // In a real serverless implementation, items would be a separate insert
            // For simplicity in this transition, we assume business logic handles it or use RPC
            const { items, ...quoteData } = data;
            const { data: result, error } = await supabase
                .from('quotations')
                .insert([quoteData])
                .select()
                .single();
            if (error) throw error;

            if (items && items.length > 0) {
                const itemsWithQuoteId = items.map(item => ({ ...item, quotation_id: result.id }));
                await supabase.from('quotation_items').insert(itemsWithQuoteId);
            }

            return result as Quotation;
        }
        const res = await api.post<any>('/quotations', data);
        return (res.data ? res.data : res) as Quotation;
    },

    update: async (id: number, data: Partial<Quotation>): Promise<Quotation> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { items, ...quoteData } = data;
            const { data: result, error } = await supabase
                .from('quotations')
                .update(quoteData)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result as Quotation;
        }
        const res = await api.put<any>(`/quotations/${id}`, data);
        return (res.data ? res.data : res) as Quotation;
    },

    delete: async (id: number): Promise<{ message: string }> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase
                .from('quotations')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { message: 'Quotation deleted successfully' };
        }
        const res = await api.delete<any>(`/quotations/${id}`);
        return res;
    },

    getProjectTypes: async (): Promise<ProjectType[]> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('project_types')
                .select('*')
                .order('type_name', { ascending: true });
            if (error) throw error;
            return data as ProjectType[];
        }
        const res = await api.get<any>('/settings/project-types');
        return (res.data ? res.data : res) as ProjectType[];
    }
};
