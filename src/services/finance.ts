import { api } from './api';

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
    getAllRevenue: () => api.get<Revenue[]>('/revenue'),
    createRevenue: (data: Omit<Revenue, 'id' | 'customer' | 'type'>) => api.post<Revenue>('/revenue', data),
    updateRevenue: (id: number, data: Partial<Revenue>) => api.put<Revenue>(`/revenue/${id}`, data),
    deleteRevenue: (id: number) => api.delete<{ message: string }>(`/revenue/${id}`),

    // Expenses
    getAllExpenses: () => api.get<Expense[]>('/expenses'),
    createExpense: (data: Omit<Expense, 'id' | 'supplier' | 'type'>) => api.post<Expense>('/expenses', data),
    updateExpense: (id: number, data: Partial<Expense>) => api.put<Expense>(`/expenses/${id}`, data),
    deleteExpense: (id: number) => api.delete<{ message: string }>(`/expenses/${id}`),
};
