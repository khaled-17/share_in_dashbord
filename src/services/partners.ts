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
    getAll: async () => {
        const res = await api.get<any>('/partners');
        return (res.data ? res.data : res) as Partner[];
    },
    getById: async (id: number) => {
        const res = await api.get<any>(`/partners/${id}`);
        return (res.data ? res.data : res) as Partner;
    },
    getSummary: async (id: number) => {
        const res = await api.get<any>(`/partners/${id}/summary`);
        return (res.data ? res.data : res) as PartnerSummary;
    },
    create: async (data: Omit<Partner, 'id' | 'current_capital' | 'created_at'>) => {
        const res = await api.post<any>('/partners', data);
        return (res.data ? res.data : res) as Partner;
    },
    update: async (id: number, data: Partial<Pick<Partner, 'name' | 'phone' | 'email'>>) => {
        const res = await api.put<any>(`/partners/${id}`, data);
        return (res.data ? res.data : res) as Partner;
    },
    delete: async (id: number) => {
        const res = await api.delete<any>(`/partners/${id}`);
        return res;
    },
};
