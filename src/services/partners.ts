import { api } from './api';

export interface Partner {
    id: number;
    partner_code: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    initial_capital: number;
    current_capital: number;
    created_at: string;
    receipt_vouchers?: any[];
    payment_vouchers?: any[];
}

export interface PartnerSummary {
    partner_code: string;
    name: string;
    initial_capital: number;
    current_capital: number;
    total_capital_increase: number;
    total_withdrawals: number;
    net_capital: number;
}

export const partnerService = {
    getAll: () => api.get<Partner[]>('/partners'),

    getById: (id: number) => api.get<Partner>(`/partners/${id}`),

    getSummary: (id: number) => api.get<PartnerSummary>(`/partners/${id}/summary`),

    create: (data: Omit<Partner, 'id' | 'current_capital' | 'created_at'>) =>
        api.post<Partner>('/partners', data),

    update: (id: number, data: Partial<Pick<Partner, 'name' | 'phone' | 'email'>>) =>
        api.put<Partner>(`/partners/${id}`, data),

    delete: (id: number) => api.delete<{ message: string }>(`/partners/${id}`),
};
