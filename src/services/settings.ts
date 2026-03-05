import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface ExpenseType {
    id: number;
    exptype_id: string;
    exptype_name: string;
    category?: string | null;
}

export interface RevenueType {
    id: number;
    revtype_id: string;
    revtype_name: string;
    paymethod: string;
}

export interface ProjectType {
    id: number;
    type_id: string;
    type_name: string;
}

export const settingsService = {
    // Expense Types
    getExpenseTypes: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase.from('expense_types').select('*').order('exptype_name', { ascending: true });
            if (error) throw error;
            return data as ExpenseType[];
        }
        const res = await api.get<any>('/settings/expense-types');
        return (res.data ? res.data : res) as ExpenseType[];
    },
    createExpenseType: async (data: Omit<ExpenseType, 'id'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('expense_types').insert([data]).select().single();
            if (error) throw error;
            return result as ExpenseType;
        }
        const res = await api.post<any>('/settings/expense-types', data);
        return (res.data ? res.data : res) as ExpenseType;
    },
    updateExpenseType: async (id: number, data: Partial<ExpenseType>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('expense_types').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result as ExpenseType;
        }
        const res = await api.put<any>(`/settings/expense-types/${id}`, data);
        return (res.data ? res.data : res) as ExpenseType;
    },
    deleteExpenseType: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('expense_types').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Expense type deleted successfully' };
        }
        const res = await api.delete<any>(`/settings/expense-types/${id}`);
        return res.data ? res.data : res;
    },

    // Revenue Types
    getRevenueTypes: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase.from('revenue_types').select('*').order('revtype_name', { ascending: true });
            if (error) throw error;
            return data as RevenueType[];
        }
        const res = await api.get<any>('/settings/revenue-types');
        return (res.data ? res.data : res) as RevenueType[];
    },
    createRevenueType: async (data: Omit<RevenueType, 'id'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('revenue_types').insert([data]).select().single();
            if (error) throw error;
            return result as RevenueType;
        }
        const res = await api.post<any>('/settings/revenue-types', data);
        return (res.data ? res.data : res) as RevenueType;
    },
    updateRevenueType: async (id: number, data: Partial<RevenueType>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('revenue_types').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result as RevenueType;
        }
        const res = await api.put<any>(`/settings/revenue-types/${id}`, data);
        return (res.data ? res.data : res) as RevenueType;
    },
    deleteRevenueType: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('revenue_types').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Revenue type deleted successfully' };
        }
        const res = await api.delete<any>(`/settings/revenue-types/${id}`);
        return res.data ? res.data : res;
    },

    // Project Types
    getProjectTypes: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase.from('project_types').select('*').order('type_name', { ascending: true });
            if (error) throw error;
            return data as ProjectType[];
        }
        const res = await api.get<any>('/settings/project-types');
        return (res.data ? res.data : res) as ProjectType[];
    },
    createProjectType: async (data: Omit<ProjectType, 'id'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('project_types').insert([data]).select().single();
            if (error) throw error;
            return result as ProjectType;
        }
        const res = await api.post<any>('/settings/project-types', data);
        return (res.data ? res.data : res) as ProjectType;
    },
    updateProjectType: async (id: number, data: Partial<ProjectType>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('project_types').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result as ProjectType;
        }
        const res = await api.put<any>(`/settings/project-types/${id}`, data);
        return (res.data ? res.data : res) as ProjectType;
    },
    deleteProjectType: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('project_types').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Project type deleted successfully' };
        }
        const res = await api.delete<any>(`/settings/project-types/${id}`);
        return res.data ? res.data : res;
    },
};
