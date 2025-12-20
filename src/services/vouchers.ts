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
    getAll: (params?: {
        start_date?: string;
        end_date?: string;
        source_type?: string;
        payment_method?: string;
    }) => {
        const query = new URLSearchParams(params as any).toString();
        return api.get<ReceiptVoucher[]>(`/receipt-vouchers${query ? '?' + query : ''}`);
    },

    getById: (id: number) => api.get<ReceiptVoucher>(`/receipt-vouchers/${id}`),

    getStats: (params?: { start_date?: string; end_date?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return api.get<VoucherStats>(`/receipt-vouchers/stats/summary${query ? '?' + query : ''}`);
    },

    create: (data: any) => api.post<ReceiptVoucher>('/receipt-vouchers', data),

    update: (id: number, data: Partial<Pick<ReceiptVoucher, 'description' | 'received_from'>>) =>
        api.put<ReceiptVoucher>(`/receipt-vouchers/${id}`, data),

    delete: (id: number) => api.delete<{ message: string }>(`/receipt-vouchers/${id}`),
};

export const paymentVoucherService = {
    getAll: (params?: {
        start_date?: string;
        end_date?: string;
        beneficiary_type?: string;
        payment_method?: string;
    }) => {
        const query = new URLSearchParams(params as any).toString();
        return api.get<PaymentVoucher[]>(`/payment-vouchers${query ? '?' + query : ''}`);
    },

    getById: (id: number) => api.get<PaymentVoucher>(`/payment-vouchers/${id}`),

    getStats: (params?: { start_date?: string; end_date?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return api.get<VoucherStats>(`/payment-vouchers/stats/summary${query ? '?' + query : ''}`);
    },

    create: (data: any) => api.post<PaymentVoucher>('/payment-vouchers', data),

    update: (id: number, data: Partial<Pick<PaymentVoucher, 'description' | 'paid_to'>>) =>
        api.put<PaymentVoucher>(`/payment-vouchers/${id}`, data),

    delete: (id: number) => api.delete<{ message: string }>(`/payment-vouchers/${id}`),
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
    getAll: (params?: {
        status?: string;
        start_date?: string;
        end_date?: string;
    }) => {
        const query = new URLSearchParams(params as any).toString();
        return api.get<any[]>(`/checks${query ? '?' + query : ''}`);
    },

    getById: (id: number) => api.get<any>(`/checks/${id}`),

    updateStatus: (id: number, data: { status: string; notes?: string }) =>
        api.put<any>(`/checks/${id}/status`, data),

    getStats: (params?: { start_date?: string; end_date?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return api.get<CheckStats>(`/checks/stats/summary${query ? '?' + query : ''}`);
    },

    getDueSoon: () => api.get<any[]>('/checks/pending/due-soon'),
};
