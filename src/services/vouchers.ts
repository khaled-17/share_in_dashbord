import { api } from './api';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config';

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
        if (APP_CONFIG.currentSource === 'supabase') {
            let query = supabase
                .from('receipt_vouchers')
                .select('*, customer:customers(name), partner:partners(name), check:check_details(*)');

            if (params?.start_date) query = query.gte('voucher_date', params.start_date);
            if (params?.end_date) query = query.lte('voucher_date', params.end_date);
            if (params?.source_type) query = query.eq('source_type', params.source_type);
            if (params?.payment_method) query = query.eq('payment_method', params.payment_method);

            const { data, error } = await query.order('voucher_date', { ascending: false });
            if (error) throw error;
            return data as ReceiptVoucher[];
        }
        const queryStr = new URLSearchParams(params as any).toString();
        return api.get<ReceiptVoucher[]>(`/receipt-vouchers${queryStr ? '?' + queryStr : ''}`);
    },

    getById: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('receipt_vouchers')
                .select('*, customer:customers(*), partner:partners(*), check:check_details(*)')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as ReceiptVoucher;
        }
        return api.get<ReceiptVoucher>(`/receipt-vouchers/${id}`);
    },

    getStats: async (params?: { start_date?: string; end_date?: string }) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            // Stats usually require more complex queries; simplified for now
            const { data, error } = await supabase.from('receipt_vouchers').select('amount, payment_method');
            if (error) throw error;
            const total = data.reduce((sum, v) => sum + v.amount, 0);
            return {
                total_amount: total,
                total_count: data.length,
                by_payment_method: {},
                pending_checks: 0
            } as VoucherStats;
        }
        const query = new URLSearchParams(params as any).toString();
        return api.get<VoucherStats>(`/receipt-vouchers/stats/summary${query ? '?' + query : ''}`);
    },

    create: async (data: any) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('receipt_vouchers')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as ReceiptVoucher;
        }
        return api.post<ReceiptVoucher>('/receipt-vouchers', data);
    },

    update: async (id: number, data: Partial<Pick<ReceiptVoucher, 'description' | 'received_from'>>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('receipt_vouchers')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result as ReceiptVoucher;
        }
        return api.put<ReceiptVoucher>(`/receipt-vouchers/${id}`, data);
    },

    delete: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('receipt_vouchers').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Voucher deleted successfully' };
        }
        return api.delete<{ message: string }>(`/receipt-vouchers/${id}`);
    },
};

export const paymentVoucherService = {
    getAll: async (params?: {
        start_date?: string;
        end_date?: string;
        beneficiary_type?: string;
        payment_method?: string;
    }) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            let query = supabase
                .from('payment_vouchers')
                .select('*, supplier:suppliers(name), employee:employees(name), partner:partners(name), check:check_details(*)');

            if (params?.start_date) query = query.gte('voucher_date', params.start_date);
            if (params?.end_date) query = query.lte('voucher_date', params.end_date);
            if (params?.beneficiary_type) query = query.eq('beneficiary_type', params.beneficiary_type);
            if (params?.payment_method) query = query.eq('payment_method', params.payment_method);

            const { data, error } = await query.order('voucher_date', { ascending: false });
            if (error) throw error;
            return data as PaymentVoucher[];
        }
        const queryStr = new URLSearchParams(params as any).toString();
        return api.get<PaymentVoucher[]>(`/payment-vouchers${queryStr ? '?' + queryStr : ''}`);
    },

    getById: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase
                .from('payment_vouchers')
                .select('*, supplier:suppliers(*), employee:employees(*), partner:partners(*), check:check_details(*)')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as PaymentVoucher;
        }
        return api.get<PaymentVoucher>(`/payment-vouchers/${id}`);
    },

    getStats: async (params?: { start_date?: string; end_date?: string }) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase.from('payment_vouchers').select('amount');
            if (error) throw error;
            const total = data.reduce((sum, v) => sum + v.amount, 0);
            return {
                total_amount: total,
                total_count: data.length,
                by_payment_method: {},
                pending_checks: 0
            } as VoucherStats;
        }
        const query = new URLSearchParams(params as any).toString();
        return api.get<VoucherStats>(`/payment-vouchers/stats/summary${query ? '?' + query : ''}`);
    },

    create: async (data: any) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('payment_vouchers')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result as PaymentVoucher;
        }
        return api.post<PaymentVoucher>('/payment-vouchers', data);
    },

    update: async (id: number, data: Partial<Pick<PaymentVoucher, 'description' | 'paid_to'>>) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('payment_vouchers')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result as PaymentVoucher;
        }
        return api.put<PaymentVoucher>(`/payment-vouchers/${id}`, data);
    },

    delete: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { error } = await supabase.from('payment_vouchers').delete().eq('id', id);
            if (error) throw error;
            return { message: 'Voucher deleted successfully' };
        }
        return api.delete<{ message: string }>(`/payment-vouchers/${id}`);
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
        if (APP_CONFIG.currentSource === 'supabase') {
            let query = supabase.from('check_details').select('*');
            if (params?.status) query = query.eq('status', params.status);
            if (params?.start_date) query = query.gte('check_date', params.start_date);
            if (params?.end_date) query = query.lte('check_date', params.end_date);

            const { data, error } = await query.order('check_date', { ascending: true });
            if (error) throw error;
            return data;
        }
        const queryStr = new URLSearchParams(params as any).toString();
        return api.get<any[]>(`/checks${queryStr ? '?' + queryStr : ''}`);
    },

    getById: async (id: number) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase.from('check_details').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        }
        return api.get<any>(`/checks/${id}`);
    },

    updateStatus: async (id: number, data: { status: string; notes?: string }) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data: result, error } = await supabase
                .from('check_details')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result;
        }
        return api.put<any>(`/checks/${id}/status`, data);
    },

    getStats: async (params?: { start_date?: string; end_date?: string }) => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const { data, error } = await supabase.from('check_details').select('status, amount');
            if (error) throw error;
            // Simple aggregation for now
            return {
                total_count: data.length,
                total_amount: data.reduce((s, c) => s + c.amount, 0),
                by_status: { pending: 0, cleared: 0, bounced: 0, cancelled: 0 },
                by_type: { receipt: 0, payment: 0 }
            } as CheckStats;
        }
        const query = new URLSearchParams(params as any).toString();
        return api.get<CheckStats>(`/checks/stats/summary${query ? '?' + query : ''}`);
    },

    getDueSoon: async () => {
        if (APP_CONFIG.currentSource === 'supabase') {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('check_details')
                .select('*')
                .eq('status', 'pending')
                .gte('check_date', today)
                .limit(5);
            if (error) throw error;
            return data;
        }
        return api.get<any[]>('/checks/pending/due-soon');
    },
};
