import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { financeService } from '../../services/finance';
import { companyService, type CompanySettings } from '../../services/company';
import { receiptVoucherService, paymentVoucherService } from '../../services/vouchers';
import { quotationService } from '../../services/quotations';

interface Transaction {
  id: number;
  type: 'قبض' | 'صرف';
  description: string;
  amount: number;
  date: string;
}

interface Stats {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  quotationsCount: number;
  quotationsStatus: {
    accepted: number;
    sent: number;
    draft: number;
    rejected: number;
  };
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 0,
    quotationsCount: 0,
    quotationsStatus: { accepted: 0, sent: 0, draft: 0, rejected: 0 }
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const [
        allRevenue,
        allExpenses,
        receiptVouchers,
        paymentVouchers,
        quotations,
        companyData
      ] = await Promise.all([
        financeService.getAllRevenue(),
        financeService.getAllExpenses(),
        receiptVoucherService.getAll(),
        paymentVoucherService.getAll(),
        quotationService.getAll(),
        companyService.getSettings()
      ]);

      setCompany(companyData);

      const revenueData = allRevenue || [];
      const expensesData = allExpenses || [];
      const receiptsData = receiptVouchers || [];
      const paymentsData = paymentVouchers || [];
      const quotesData = quotations || [];

      // Calculate totals (Base Finance + Vouchers)
      const totalRev = revenueData.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalReceipts = receiptsData.reduce((sum, item) => sum + (item.amount || 0), 0);

      const totalExp = expensesData.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalPayments = paymentsData.reduce((sum, item) => sum + (item.amount || 0), 0);

      const totalRevenue = totalRev + totalReceipts;
      const totalExpenses = totalExp + totalPayments;
      const balance = totalRevenue - totalExpenses;

      const quotationsCount = quotesData.length;
      const quotationsStatus = {
        accepted: quotesData.filter(q => q.status === 'مقبول').length,
        sent: quotesData.filter(q => q.status === 'مرسل').length,
        draft: quotesData.filter(q => q.status === 'مسودة').length,
        rejected: quotesData.filter(q => q.status === 'مرفوض').length,
      };

      setStats({
        totalRevenue,
        totalExpenses,
        balance,
        quotationsCount,
        quotationsStatus
      });

      // Recent Transactions (Combine all sources)
      const transactions: Transaction[] = [
        ...revenueData.map(item => ({
          id: item.id,
          type: 'قبض' as const,
          description: item.notes || `إيراد: ${(item.type as any)?.revtype_name || 'عام'} - ${(item.customer as any)?.name || 'عميل'}`,
          amount: item.amount,
          date: item.rev_date,
        })),
        ...receiptsData.map(item => ({
          id: item.id * 1000, // Namespace separation
          type: 'قبض' as const,
          description: item.description || `سند قبض من ${item.received_from}`,
          amount: item.amount,
          date: item.voucher_date,
        })),
        ...expensesData.map(item => ({
          id: item.id,
          type: 'صرف' as const,
          description: item.notes || `مصروف: ${(item.type as any)?.exptype_name || 'عام'} - ${(item.supplier as any)?.name || 'مورد'}`,
          amount: -item.amount,
          date: item.exp_date,
        })),
        ...paymentsData.map(item => ({
          id: item.id * 2000, // Namespace separation
          type: 'صرف' as const,
          description: item.description || `سند صرف إلى ${item.paid_to}`,
          amount: -item.amount,
          date: item.voucher_date,
        })),
      ];

      // Sort combined by date and take top 5
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(transactions.slice(0, 5));

    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsData = [
    {
      title: 'إجمالي المقبوضات',
      value: `${stats.totalRevenue.toLocaleString('ar-EG')} ج.م`,
      change: '',
      changeType: 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'إجمالي المصروفات',
      value: `${stats.totalExpenses.toLocaleString('ar-EG')} ج.م`,
      change: '',
      changeType: 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'red',
    },
    {
      title: 'الرصيد الحالي',
      value: `${stats.balance.toLocaleString('ar-EG')} ج.م`,
      change: '',
      changeType: stats.balance >= 0 ? 'increase' : 'decrease',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'عروض الأسعار',
      value: `${stats.quotationsCount} عرض`,
      change: `مقبول: ${stats.quotationsStatus.accepted} | مرسل: ${stats.quotationsStatus.sent}`,
      changeType: 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'purple',
    },
  ];

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            direction: 'rtl',
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            duration: 4000,
          },
        }}
      />

      <div className="space-y-6">
        {/* Company Profile Header */}
        {!isLoading && company && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-24 h-24 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 shrink-0">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-center md:text-right flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                {company.description}
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-700">
                <p>
                  الموقف المالي الحالي: تمتلك الشركة رصيداً إجمالياً قدره <span className="font-bold text-primary-600">{stats.balance.toLocaleString('ar-EG')} ج.م</span> الإيرادات الكلية بلغت <span className="font-bold text-green-600">{stats.totalRevenue.toLocaleString('ar-EG')} ج.م</span> مقابل مصروفات إجمالية <span className="font-bold text-red-600">{stats.totalExpenses.toLocaleString('ar-EG')} ج.م</span>.
                </p>
              </div>
              {company.about && (
                <p className="text-sm text-gray-500 mt-3 border-r-4 border-primary-500 pr-4 italic">
                  {company.about}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="flex items-center gap-2 text-sm text-gray-600 justify-end">
                <span>{company.phone}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 justify-end">
                <span>{company.email}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 justify-end">
                <span>{company.address}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {isLoading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
              const colorClasses = {
                green: { border: 'bg-green-500', icon: 'bg-green-100 text-green-600' },
                red: { border: 'bg-red-500', icon: 'bg-red-100 text-red-600' },
                blue: { border: 'bg-blue-500', icon: 'bg-blue-100 text-blue-600' },
                purple: { border: 'bg-purple-500', icon: 'bg-purple-100 text-purple-600' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];

              return (
                <Card key={index} hover className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${colors.border}`}></div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                      {stat.change && (
                        <span className={`text-xs px-2 py-1 rounded-full ${stat.changeType === 'increase'
                          ? 'bg-green-100 text-green-700'
                          : stat.changeType === 'decrease'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}>
                          {stat.change}
                        </span>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${colors.icon}`}>
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Recent Transactions */}
        <Card title="آخر العمليات المالية" subtitle="عرض أحدث 5 عمليات">
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    <svg className={`w-6 h-6 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {transaction.amount > 0 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ar-EG')} ج.م
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${transaction.type === 'قبض' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {transaction.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="إجراءات سريعة">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/revenue')}
              className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary-700">إيراد جديد</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/expenses')}
              className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary-700">مصروف جديد</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/quotations')}
              className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary-700">عرض سعر جديد</span>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </>
  );
};
