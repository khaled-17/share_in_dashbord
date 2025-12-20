import { api } from './api';
import type { Customer } from './customers';

export interface QuotationItem {
    id?: number;
    description: string;
    unit_price: number;
    quantity: number;
    total: number;
}

export interface ProjectType {
    id: number;
    type_id: string;
    type_name: string;
}

export interface Quotation {
    id: number;
    customer_id: string;
    project_type_id?: string | null;
    project_manager?: string | null;
    project_name?: string | null;
    quote_date: string;
    delivery_date?: string | null;
    totalamount: number;
    paid_adv?: number | null;
    adv_date?: string | null;
    receipt_no?: string | null;
    status: string;
    customer?: Customer;
    project_type?: ProjectType;
    items?: QuotationItem[];
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
    },

    getProjectTypes: async (): Promise<ProjectType[]> => {
        return api.get<ProjectType[]>('/settings/project-types');
    }
};
