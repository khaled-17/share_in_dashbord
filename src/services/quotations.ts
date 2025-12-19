import { api } from './api';
import type { Customer } from './customers';
import type { Supplier } from './suppliers';

export interface Quotation {
    id: number;
    customer_id: string;
    supplier_id?: string | null;
    event_name?: string | null;
    quote_date: string;
    delivery_date?: string | null;
    totalamount: number;
    paid_adv?: number | null;
    adv_date?: string | null;
    receipt_no?: string | null;
    status: string;
    customer?: Customer;
    supplier?: Supplier;
}

export const quotationService = {
    getAll: async (): Promise<Quotation[]> => {
        return api.get<Quotation[]>('/quotations');
    },

    getById: async (id: number): Promise<Quotation> => {
        return api.get<Quotation>(`/quotations/${id}`);
    },

    create: async (data: Partial<Quotation>): Promise<Quotation> => {
        return api.post<Quotation>('/quotations', data);
    },

    update: async (id: number, data: Partial<Quotation>): Promise<Quotation> => {
        return api.put<Quotation>(`/quotations/${id}`, data);
    },

    delete: async (id: number): Promise<{ message: string }> => {
        return api.delete<{ message: string }>(`/quotations/${id}`);
    }
};
