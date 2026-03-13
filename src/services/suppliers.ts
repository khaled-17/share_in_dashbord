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
    getAll: async () => {
        const res = await api.get<any>('/suppliers');
        return (res.data ? res.data : res) as Supplier[];
    },
    getById: async (id: string) => {
        const res = await api.get<any>(`/suppliers/${id}`);
        return (res.data ? res.data : res) as Supplier;
    },
    create: async (data: Omit<Supplier, 'id' | 'created_at'>) => {
        const res = await api.post<any>('/suppliers', data);
        return (res.data ? res.data : res) as Supplier;
    },
    update: async (id: number, data: Partial<Supplier>) => {
        const res = await api.put<any>(`/suppliers/${id}`, data);
        return (res.data ? res.data : res) as Supplier;
    },
    delete: async (id: number) => {
        const res = await api.delete<any>(`/suppliers/${id}`);
        return res;
    },
};
