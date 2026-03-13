import { api } from './api';
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
        const res = await api.get<any>(`/reports/ledger?startDate=${startDate}&endDate=${endDate}`);
        return (res.data ? res.data : res) as LedgerReportResponse;
    }
};
