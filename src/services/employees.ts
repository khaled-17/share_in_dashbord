import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface Employee {
    id: number;
    emp_code: string;
    name: string;
    phone?: string | null;
    position?: string | null;
    salary?: number | null;
    start_date?: string | null;
}

export const employeeService = {
    getAll: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            return data as Employee[];
        }
        const res = await api.get<any>('/employees');
        return (res.data ? res.data : res) as Employee[];
    },

    create: async (data: Omit<Employee, 'id'>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('employees')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as Employee;
        }
        const res = await api.post<any>('/employees', data);
        return (res.data ? res.data : res) as Employee;
    },

    update: async (id: number, data: Partial<Employee>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('employees')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result as Employee;
        }
        const res = await api.put<any>(`/employees/${id}`, data);
        return (res.data ? res.data : res) as Employee;
    },

    delete: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('employees').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Employee deleted successfully' };
        }
        const res = await api.delete<{ message: string }>(`/employees/${id}`);
        return res;
    },
};
