import { api } from './api';

export interface Supplier {
    id: number;
    supplier_id: string;
    name: string;
    phone?: string | null;
    speciality?: string | null;
}

export const supplierService = {
    getAll: () => api.get<Supplier[]>('/suppliers'),

    create: (data: Omit<Supplier, 'id'>) => api.post<Supplier>('/suppliers', data),

    update: (id: number, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data),

    delete: (id: number) => api.delete<{ message: string }>(`/suppliers/${id}`),
};
