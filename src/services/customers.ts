import { api } from './api';

export interface Customer {
    customer_id: string;
    name: string;
    phone?: string | null;
    address?: string | null;
}

export const customerService = {
    getAll: () => api.get<Customer[]>('/customers'),

    create: (data: Customer) => api.post<Customer>('/customers', data),

    update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),

    delete: (id: string) => api.delete<{ message: string }>(`/customers/${id}`),
};
