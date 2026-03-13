import { api } from './api';
export interface CheckDetail {
    id: number;
    check_number: string;
    bank_name: string;
    check_date: string;
    beneficiary_name: string;
    amount: number;
    status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
    notes?: string | null;
    created_at: string;
}
export interface ReceiptVoucher {
    id: number;
    voucher_number: string;
    voucher_date: string;
    amount: number;
    source_type: 'customer' | 'partner_capital' | 'advance_payment' | 'other';
    customer_id?: string | null;
    partner_id?: number | null;
    payment_method: 'cash' | 'check' | 'bank_transfer';
    check_id?: number | null;
    description?: string | null;
    received_from: string;
    created_by?: string | null;
    created_at: string;
    customer?: any;
    partner?: any;
    check?: CheckDetail | null;
}
export interface PaymentVoucher {
    id: number;
    voucher_number: string;
    voucher_date: string;
    amount: number;
    beneficiary_type: 'supplier' | 'employee' | 'partner_withdrawal' | 'admin_expense' | 'other';
    supplier_id?: string | null;
    employee_id?: string | null;
    partner_id?: number | null;
    expense_type_id?: string | null;
    payment_method: 'cash' | 'check' | 'bank_transfer';
    check_id?: number | null;
    description?: string | null;
    paid_to: string;
    created_by?: string | null;
    created_at: string;
    supplier?: any;
    employee?: any;
    partner?: any;
    expense_type?: any;
    check?: CheckDetail | null;
}
export interface VoucherStats {
    total_amount: number;
    total_count: number;
    by_source_type?: Record<string, number>;
    by_beneficiary_type?: Record<string, number>;
    by_payment_method: Record<string, number>;
    pending_checks: number;
}
export const receiptVoucherService = {
    getAll: async (params?: {
        start_date?: string;
        end_date?: string;
        source_type?: string;
        payment_method?: string;
    }) => {
        const queryStr = params ? new URLSearchParams(params as any).toString() : '';
        const res = await api.get<any>(`/receipt-vouchers${queryStr ? `?${queryStr}` : ''}`);
        return (res.data ? res.data : res) as ReceiptVoucher[];
    },
    getById: async (id: number) => {
        const res = await api.get<any>(`/receipt-vouchers/${id}`);
        return (res.data ? res.data : res) as ReceiptVoucher;
    },
    getStats: async (params?: {
        start_date?: string;
        end_date?: string;
    }) => {
        const query = params ? new URLSearchParams(params as any).toString() : '';
        const res = await api.get<any>(`/receipt-vouchers/stats/summary${query ? `?${query}` : ''}`);
        return (res.data ? res.data : res) as VoucherStats;
    },
    create: async (data: any) => {
        const res = await api.post<any>('/receipt-vouchers', data);
        return (res.data ? res.data : res) as ReceiptVoucher;
    },
    update: async (id: number, data: Partial<Pick<ReceiptVoucher, 'description' | 'received_from'>>) => {
        const res = await api.put<any>(`/receipt-vouchers/${id}`, data);
        return (res.data ? res.data : res) as ReceiptVoucher;
    },
    delete: async (id: number) => {
        const res = await api.delete<any>(`/receipt-vouchers/${id}`);
        return res;
    },
};
export const paymentVoucherService = {
    getAll: async (params?: {
        start_date?: string;
        end_date?: string;
        beneficiary_type?: string;
        payment_method?: string;
    }) => {
        const queryStr = params ? new URLSearchParams(params as any).toString() : '';
        const res = await api.get<any>(`/payment-vouchers${queryStr ? `?${queryStr}` : ''}`);
        return (res.data ? res.data : res) as PaymentVoucher[];
    },
    getById: async (id: number) => {
        const res = await api.get<any>(`/payment-vouchers/${id}`);
        return (res.data ? res.data : res) as PaymentVoucher;
    },
    getStats: async (params?: {
        start_date?: string;
        end_date?: string;
    }) => {
        const query = params ? new URLSearchParams(params as any).toString() : '';
        const res = await api.get<any>(`/payment-vouchers/stats/summary${query ? `?${query}` : ''}`);
        return (res.data ? res.data : res) as VoucherStats;
    },
    create: async (data: any) => {
        const res = await api.post<any>('/payment-vouchers', data);
        return (res.data ? res.data : res) as PaymentVoucher;
    },
    update: async (id: number, data: Partial<Pick<PaymentVoucher, 'description' | 'paid_to'>>) => {
        const res = await api.put<any>(`/payment-vouchers/${id}`, data);
        return (res.data ? res.data : res) as PaymentVoucher;
    },
    delete: async (id: number) => {
        const res = await api.delete<any>(`/payment-vouchers/${id}`);
        return res;
    },
};
export interface CheckStats {
    total_count: number;
    total_amount: number;
    by_status: {
        pending: number;
        cleared: number;
        bounced: number;
        cancelled: number;
    };
    by_type: {
        receipt: number;
        payment: number;
    };
}
export const checkService = {
    getAll: async (params?: {
        status?: string;
        start_date?: string;
        end_date?: string;
    }) => {
        const queryStr = params ? new URLSearchParams(params as any).toString() : '';
        const res = await api.get<any>(`/checks${queryStr ? `?${queryStr}` : ''}`);
        return (res.data ? res.data : res) as any[];
    },
    getById: async (id: number) => {
        const res = await api.get<any>(`/checks/${id}`);
        return (res.data ? res.data : res) as any;
    },
    updateStatus: async (id: number, data: {
        status: string;
        notes?: string;
    }) => {
        const res = await api.put<any>(`/checks/${id}/status`, data);
        return (res.data ? res.data : res) as any;
    },
    getStats: async (params?: {
        start_date?: string;
        end_date?: string;
    }) => {
        const query = params ? new URLSearchParams(params as any).toString() : '';
        const res = await api.get<any>(`/checks/stats/summary${query ? `?${query}` : ''}`);
        return (res.data ? res.data : res) as CheckStats;
    },
    getDueSoon: async () => {
        const res = await api.get<any>('/checks/pending/due-soon');
        return (res.data ? res.data : res) as any[];
    },
};
