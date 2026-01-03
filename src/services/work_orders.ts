import { api } from './api';
import type { Customer } from './customers';
import type { Quotation } from './quotations';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

export interface WorkOrder {
    id: number;
    order_code: string;
    quotation_id: number;
    customer_id: string;
    created_at?: string;
    customer?: Customer;
    quotation?: Quotation;
}

export const workOrderService = {
    getAll: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('WorkOrder')
                .select('*, customer:customers(name), quotation:quotations(project_name)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as WorkOrder[];
        }
        return api.get<WorkOrder[]>('/work-orders');
    },

    create: async (data: Partial<WorkOrder>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('WorkOrder')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as WorkOrder;
        }
        return api.post<WorkOrder>('/work-orders', data);
    },

    delete: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('WorkOrder').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Work order deleted successfully' };
        }
        return api.delete<{ message: string }>(`/work-orders/${id}`);
    },
};
