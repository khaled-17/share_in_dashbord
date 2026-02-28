import { api } from './api';
import { APP_CONFIG } from '../config';

export interface LedgerItem {
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    type?: string;
}

export interface BudgetStats {
    sales: number;
    expenses: number;
    capitalAdded: number;
    capitalWithdrawn: number;
    netProfit: number;
}

export interface LedgerReportResponse {
    openingBalance: number;
    ledgerData: LedgerItem[];
    totals: {
        debit: number;
        credit: number;
        balance: number;
    };
    budgetStats: BudgetStats;
}

export const reportService = {
    getLedgerReport: async (startDate: string, endDate: string): Promise<LedgerReportResponse> => {
        if (APP_CONFIG.currentSource === 'supabase') {
            // Fallback to existing manual filtering logic in the component if needed, 
            // but for now we expect API to handle it.
            throw new Error('Reports not implemented for Supabase source in this service');
        }
        const res = await api.get<any>(`/reports/ledger?startDate=${startDate}&endDate=${endDate}`);
        return (res.data ? res.data : res) as LedgerReportResponse;
    }
};
