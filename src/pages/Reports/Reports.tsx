import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface LedgerItem {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export const Reports: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('2025-11-01');
  const [dateTo, setDateTo] = useState('2025-11-30');
  const [reportType, setReportType] = useState('receipts'); // Default to 'receipts' as per user request example, or 'all'
  const [ledgerData, setLedgerData] = useState<LedgerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totals, setTotals] = useState({ debit: 0, credit: 0, balance: 0 });

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      let openingBalance = 0;
      let transactions: LedgerItem[] = [];

      // 1. Calculate Opening Balance (Sum of all transactions before dateFrom)
      // This is a simplification. In a real app, you might have a separate function or table for balances.

      // Sum previous revenue
      const { data: prevRevenue, error: prevRevError } = await supabase
        .from('revenue')
        .select('amount')
        .lt('rev_date', dateFrom);

      if (prevRevError) throw prevRevError;
      const prevRevenueTotal = prevRevenue?.reduce((sum, item) => sum + item.amount, 0) || 0;

      // Sum previous expenses
      const { data: prevExpenses, error: prevExpError } = await supabase
        .from('expenses')
        .select('amount')
        .lt('exp_date', dateFrom);

      if (prevExpError) throw prevExpError;
      const prevExpensesTotal = prevExpenses?.reduce((sum, item) => sum + item.amount, 0) || 0;

      openingBalance = prevRevenueTotal - prevExpensesTotal;

      // 2. Fetch Current Period Data
      let currentRevenue: any[] = [];
      let currentExpenses: any[] = [];

      if (reportType === 'all' || reportType === 'receipts') {
        const { data: revData, error: revError } = await supabase
          .from('revenue')
          .select(`
            id,
            rev_date,
            amount,
            notes,
            customers (name)
          `)
          .gte('rev_date', dateFrom)
          .lte('rev_date', dateTo)
          .order('rev_date', { ascending: true });

        if (revError) throw revError;
        currentRevenue = revData || [];
      }

      if (reportType === 'all' || reportType === 'payments') {
        const { data: expData, error: expError } = await supabase
          .from('expenses')
          .select(`
            id,
            exp_date,
            amount,
            notes,
            suppliers (name)
          `)
          .gte('exp_date', dateFrom)
          .lte('exp_date', dateTo)
          .order('exp_date', { ascending: true });

        if (expError) throw expError;
        currentExpenses = expData || [];
      }

      // 3. Transform and Merge Data
      const revenueItems: LedgerItem[] = currentRevenue.map(item => ({
        date: item.rev_date,
        description: `قبض من ${(item.customers as any)?.name || 'غير محدد'} - ${item.notes || ''}`,
        debit: item.amount,
        credit: 0,
        balance: 0 // Calculated later
      }));

      const expenseItems: LedgerItem[] = currentExpenses.map(item => ({
        date: item.exp_date,
        description: `صرف لـ ${(item.suppliers as any)?.name || 'غير محدد'} - ${item.notes || ''}`,
        debit: 0,
        credit: item.amount,
        balance: 0 // Calculated later
      }));

      transactions = [...revenueItems, ...expenseItems].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // 4. Calculate Running Balance
      let runningBalance = openingBalance;
      const finalData = [
        {
          date: dateFrom,
          description: 'رصيد أول المدة',
          debit: 0,
          credit: 0,
          balance: openingBalance
        },
        ...transactions.map(item => {
          runningBalance += item.debit - item.credit;
          return { ...item, balance: runningBalance };
        })
      ];

      setLedgerData(finalData);

      // Calculate totals for the period
      const totalDebit = transactions.reduce((sum, item) => sum + item.debit, 0);
      const totalCredit = transactions.reduce((sum, item) => sum + item.credit, 0);
      setTotals({
        debit: totalDebit,
        credit: totalCredit,
        balance: runningBalance
      });

    } catch (err: any) {
      toast.error('فشل في تحميل التقرير: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchReportData();
  }, []); // Fetch on mount

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">إجمالي المقبوضات</p>
              <p className="text-2xl font-bold text-green-600">
                {totals.debit.toLocaleString('ar-EG')} ج.م
              </p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-600">
                {totals.credit.toLocaleString('ar-EG')} ج.م
              </p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">صافي الحركة</p>
              <p className="text-2xl font-bold text-blue-600">
                {(totals.debit - totals.credit).toLocaleString('ar-EG')} ج.م
              </p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">الرصيد النهائي</p>
              <p className="text-2xl font-bold text-purple-600">
                {totals.balance.toLocaleString('ar-EG')} ج.م
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="تصفية التقارير">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="من تاريخ"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            fullWidth
          />
          <Input
            type="date"
            label="إلى تاريخ"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            fullWidth
          />
          <Select
            label="نوع التقرير"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'all', label: 'جميع العمليات' },
              { value: 'receipts', label: 'المقبوضات فقط' },
              { value: 'payments', label: 'المصروفات فقط' },
            ]}
            fullWidth
          />
          <div className="flex items-end gap-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={fetchReportData}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري البحث...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  بحث
                </>
              )}
            </Button>
            <Button variant="outline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card
        title="كشف الحساب"
        subtitle={`من ${dateFrom} إلى ${dateTo}`}
        headerAction={
          <div className="flex gap-2">
            <Button variant="success" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              تصدير Excel
            </Button>
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              طباعة
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">البيان</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">مدين</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">دائن</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : ledgerData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    لا توجد بيانات في هذه الفترة
                  </td>
                </tr>
              ) : (
                ledgerData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{row.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {row.debit > 0 ? (
                        <span className="font-semibold text-green-600">
                          {row.debit.toLocaleString('ar-EG')} ج.م
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {row.credit > 0 ? (
                        <span className="font-semibold text-red-600">
                          {row.credit.toLocaleString('ar-EG')} ج.م
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="font-bold text-blue-600">
                        {row.balance.toLocaleString('ar-EG')} ج.م
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {/* Totals Row */}
              {!isLoading && ledgerData.length > 0 && (
                <tr className="bg-primary-50 font-bold border-t-2 border-primary-200">
                  <td className="px-6 py-4" colSpan={2}>الإجمالي</td>
                  <td className="px-6 py-4 text-center text-green-700">
                    {totals.debit.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="px-6 py-4 text-center text-red-700">
                    {totals.credit.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="px-6 py-4 text-center text-blue-700">
                    {totals.balance.toLocaleString('ar-EG')} ج.م
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
