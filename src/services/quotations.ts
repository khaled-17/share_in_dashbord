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
        const res = await api.get<any>('/quotations');
        return (res.data ? res.data : res) as Quotation[];
    },
    getById: async (id: number): Promise<Quotation> => {
        const res = await api.get<any>(`/quotations/${id}`);
        return (res.data ? res.data : res) as Quotation;
    },
    create: async (data: Partial<Quotation>): Promise<Quotation> => {
        const res = await api.post<any>('/quotations', data);
        return (res.data ? res.data : res) as Quotation;
    },
    update: async (id: number, data: Partial<Quotation>): Promise<Quotation> => {
        const res = await api.put<any>(`/quotations/${id}`, data);
        return (res.data ? res.data : res) as Quotation;
    },
    delete: async (id: number): Promise<{
        message: string;
    }> => {
        const res = await api.delete<any>(`/quotations/${id}`);
        return res;
    },
    getProjectTypes: async (): Promise<ProjectType[]> => {
        const res = await api.get<any>('/settings/project-types');
        return (res.data ? res.data : res) as ProjectType[];
    }
};
