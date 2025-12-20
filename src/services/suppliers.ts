import { api } from './api';

export interface Supplier {
    id: number;
    supplier_id: string;
    name: string; // Company Name
    contact_person?: string | null;
    email?: string | null;
    phone?: string | null;
    secondary_phone?: string | null;
    address?: string | null;
    speciality?: string | null;
    created_at?: string;
    expenses?: any[];
}

export const supplierService = {
    getAll: () => api.get<Supplier[]>('/suppliers'),
    getById: (id: string) => api.get<Supplier>(`/suppliers/${id}`),

    create: (data: Omit<Supplier, 'id'>) => api.post<Supplier>('/suppliers', data),

    update: (id: number, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data),

    delete: (id: number) => api.delete<{ message: string }>(`/suppliers/${id}`),
};
