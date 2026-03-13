import { api } from './api';
export interface Customer {
    customer_id: string;
    name: string;
    contact_person: string;
    company_email: string;
    contact_email: string;
    phone: string;
    secondary_phone: string;
    address: string;
    created_at?: string;
    revenues?: any[];
    quotations?: any[];
    work_orders?: any[];
}
export interface PaginatedResponse<T> {
    success?: boolean;
    data: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export const customerService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        if (params?.search)
            queryParams.append('search', params.search);
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const res = await api.get<any>(`/customers${queryString}`);
        // Support both wrapped API format and raw array format just in case
        if (res && res.data && Array.isArray(res.data)) {
            return res as PaginatedResponse<Customer>;
        }
        else if (Array.isArray(res)) {
            return { data: res } as PaginatedResponse<Customer>;
        }
        return { data: [] } as PaginatedResponse<Customer>;
    },
    getById: async (id: string) => {
        const res = await api.get<any>(`/customers/${id}`);
        return (res.data ? res.data : res) as Customer;
    },
    create: async (data: Customer) => {
        const res = await api.post<any>('/customers', data);
        return (res.data ? res.data : res) as Customer;
    },
    update: async (id: string, data: Partial<Customer>) => {
        const res = await api.put<any>(`/customers/${id}`, data);
        return (res.data ? res.data : res) as Customer;
    },
    delete: async (id: string) => {
        const res = await api.delete<any>(`/customers/${id}`);
        return res;
    }
};
