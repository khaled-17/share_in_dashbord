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
        return api.get<ExpenseType[]>('/settings/expense-types');
    },
    createExpenseType: async (data: Omit<ExpenseType, 'id'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('expense_types').insert([data]).select().single();
            if (error) throw error;
            return result as ExpenseType;
        }
        return api.post<ExpenseType>('/settings/expense-types', data);
    },
    updateExpenseType: async (id: number, data: Partial<ExpenseType>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('expense_types').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result as ExpenseType;
        }
        return api.put<ExpenseType>(`/settings/expense-types/${id}`, data);
    },
    deleteExpenseType: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('expense_types').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Expense type deleted successfully' };
        }
        return api.delete<{ message: string }>(`/settings/expense-types/${id}`);
    },

    // Revenue Types
    getRevenueTypes: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase.from('revenue_types').select('*').order('revtype_name', { ascending: true });
            if (error) throw error;
            return data as RevenueType[];
        }
        return api.get<RevenueType[]>('/settings/revenue-types');
    },
    createRevenueType: async (data: Omit<RevenueType, 'id'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('revenue_types').insert([data]).select().single();
            if (error) throw error;
            return result as RevenueType;
        }
        return api.post<RevenueType>('/settings/revenue-types', data);
    },
    updateRevenueType: async (id: number, data: Partial<RevenueType>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('revenue_types').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result as RevenueType;
        }
        return api.put<RevenueType>(`/settings/revenue-types/${id}`, data);
    },
    deleteRevenueType: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('revenue_types').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Revenue type deleted successfully' };
        }
        return api.delete<{ message: string }>(`/settings/revenue-types/${id}`);
    },

    // Project Types
    getProjectTypes: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase.from('project_types').select('*').order('type_name', { ascending: true });
            if (error) throw error;
            return data as ProjectType[];
        }
        return api.get<ProjectType[]>('/settings/project-types');
    },
    createProjectType: async (data: Omit<ProjectType, 'id'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('project_types').insert([data]).select().single();
            if (error) throw error;
            return result as ProjectType;
        }
        return api.post<ProjectType>('/settings/project-types', data);
    },
    updateProjectType: async (id: number, data: Partial<ProjectType>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase.from('project_types').update(data).eq('id', id).select().single();
            if (error) throw error;
            return result as ProjectType;
        }
        return api.put<ProjectType>(`/settings/project-types/${id}`, data);
    },
    deleteProjectType: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('project_types').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Project type deleted successfully' };
        }
        return api.delete<{ message: string }>(`/settings/project-types/${id}`);
    },
};
