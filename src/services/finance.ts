import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface Revenue {
    id: number;
    rev_date: string;
    amount: number;
    receipt_no?: string | null;
    quote_id?: number | null;
    notes?: string | null;
    customer_id: string;
    revtype_id: string;
    // Included relations
    customer?: { name: string };
    type?: { revtype_name: string };
}

export interface Expense {
    id: number;
    exp_date: string;
    amount: number;
    receipt_no?: string | null;
    quote_id?: number | null;
    notes?: string | null;
    supplier_id: string;
    exptype_id: string;
    // Included relations
    supplier?: { name: string };
    type?: { exptype_name: string };
}

export const financeService = {
    // Revenue
    getAllRevenue: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('revenue')
                .select('*, customer:customers(name), type:revenue_types(revtype_name)')
                .order('rev_date', { ascending: false });
            if (error) throw error;
            return data as Revenue[];
        }
        return api.get<Revenue[]>('/revenue');
    },

    createRevenue: async (data: Omit<Revenue, 'id' | 'customer' | 'type'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('revenue')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as Revenue;
        }
        return api.post<Revenue>('/revenue', data);
    },

    updateRevenue: async (id: number, data: Partial<Revenue>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('revenue')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result as Revenue;
        }
        return api.put<Revenue>(`/revenue/${id}`, data);
    },

    deleteRevenue: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('revenue').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Revenue deleted successfully' };
        }
        return api.delete<{ message: string }>(`/revenue/${id}`);
    },

    // Expenses
    getAllExpenses: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('expenses')
                .select('*, supplier:suppliers(name), type:expense_types(exptype_name)')
                .order('exp_date', { ascending: false });
            if (error) throw error;
            return data as Expense[];
        }
        return api.get<Expense[]>('/expenses');
    },

    createExpense: async (data: Omit<Expense, 'id' | 'supplier' | 'type'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('expenses')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as Expense;
        }
        return api.post<Expense>('/expenses', data);
    },

    updateExpense: async (id: number, data: Partial<Expense>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('expenses')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result as Expense;
        }
        return api.put<Expense>(`/expenses/${id}`, data);
    },

    deleteExpense: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Expense deleted successfully' };
        }
        return api.delete<{ message: string }>(`/expenses/${id}`);
    },
};
