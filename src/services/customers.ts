import { api } from './api';

export interface Customer {
    customer_id: string;
    name: string; // Company Name
    contact_person?: string | null;
    company_email?: string | null;
    contact_email?: string | null;
    phone?: string | null;
    secondary_phone?: string | null;
    address?: string | null;
    created_at?: string;
    revenues?: any[];
    quotations?: any[];
    work_orders?: any[];
}

export const customerService = {
    getAll: () => api.get<Customer[]>('/customers'),
    getById: (id: string) => api.get<Customer>(`/customers/${id}`),

    create: (data: Customer) => api.post<Customer>('/customers', data),

    update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),

    delete: (id: string) => api.delete<{ message: string }>(`/customers/${id}`),
};
