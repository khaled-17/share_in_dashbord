import { api } from './api';
export interface Revenue {
    id: number;
    code?: string; // Auto-generated
    rev_date: string;
    amount: number;
    receipt_no?: string | null;
    quote_id?: number | null;
    notes?: string | null;
    customer_id: string;
    revtype_id: string;
    // Included relations
    customer?: {
        name: string;
    };
    type?: {
        revtype_name: string;
    };
}
export interface Expense {
    id: number;
    code?: string; // Auto-generated
    exp_date: string;
    amount: number;
    receipt_no?: string | null;
    quote_id?: number | null;
    notes?: string | null;
    supplier_id: string;
    exptype_id: string;
    // Included relations
    supplier?: {
        name: string;
    };
    type?: {
        exptype_name: string;
    };
}
export const financeService = {
    // Revenue
    getAllRevenue: async () => {
        const res = await api.get<any>('/revenue');
        return (res.data ? res.data : res) as Revenue[];
    },
    createRevenue: async (data: Omit<Revenue, 'id' | 'customer' | 'type'>) => {
        const res = await api.post<any>('/revenue', data);
        return (res.data ? res.data : res) as Revenue;
    },
    updateRevenue: async (id: number, data: Partial<Revenue>) => {
        const res = await api.put<any>(`/revenue/${id}`, data);
        return (res.data ? res.data : res) as Revenue;
    },
    deleteRevenue: async (id: number) => {
        const res = await api.delete<any>(`/revenue/${id}`);
        return res;
    },
    // Expenses
    getAllExpenses: async () => {
        const res = await api.get<any>('/expenses');
        return (res.data ? res.data : res) as Expense[];
    },
    createExpense: async (data: Omit<Expense, 'id' | 'supplier' | 'type'>) => {
        const res = await api.post<any>('/expenses', data);
        return (res.data ? res.data : res) as Expense;
    },
    updateExpense: async (id: number, data: Partial<Expense>) => {
        const res = await api.put<any>(`/expenses/${id}`, data);
        return (res.data ? res.data : res) as Expense;
    },
    deleteExpense: async (id: number) => {
        const res = await api.delete<any>(`/expenses/${id}`);
        return res;
    },
};
