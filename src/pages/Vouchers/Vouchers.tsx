import React, { useState } from 'react';
import { Card, Button, Table } from '../../components/ui';

interface Voucher {
  id: number;
  voucherNumber: string;
  date: string;
  recipient: string;
  amount: number;
  description: string;
  paymentMethod: string;
  status: 'مدفوع' | 'معلق' | 'ملغي';
}

export const Vouchers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payment' | 'receipt'>('payment');
  
  const paymentVouchers: Voucher[] = [
    {
      id: 1,
      voucherNumber: 'PAY-001',
      date: '2025-11-25',
      recipient: 'شركة المواد الخام',
      amount: 8500,
      description: 'شراء مواد خام',
      paymentMethod: 'نقدي',
      status: 'مدفوع',
    },
    {
      id: 2,
      voucherNumber: 'PAY-002',
      date: '2025-11-22',
      recipient: 'موظفين الشركة',
      amount: 12000,
      description: 'رواتب شهر نوفمبر',
      paymentMethod: 'تحويل بنكي',
      status: 'مدفوع',
    },
    {
      id: 3,
      voucherNumber: 'PAY-003',
      date: '2025-11-20',
      recipient: 'شركة الكهرباء',
      amount: 3500,
      description: 'فاتورة كهرباء',
      paymentMethod: 'نقدي',
      status: 'معلق',
    },
  ];

  const receiptVouchers: Voucher[] = [
    {
      id: 1,
      voucherNumber: 'REC-001',
      date: '2025-11-25',
      recipient: 'أحمد محمد',
      amount: 15000,
      description: 'دفعة مقدمة - مشروع A',
      paymentMethod: 'تحويل بنكي',
      status: 'مدفوع',
    },
    {
      id: 2,
      voucherNumber: 'REC-002',
      date: '2025-11-23',
      recipient: 'محمود علي',
      amount: 22000,
      description: 'دفعة نهائية - مشروع B',
      paymentMethod: 'شيك',
      status: 'مدفوع',
    },
    {
      id: 3,
      voucherNumber: 'REC-003',
      date: '2025-11-21',
      recipient: 'سارة أحمد',
      amount: 18000,
      description: 'دفعة مقدمة - مشروع C',
      paymentMethod: 'نقدي',
      status: 'مدفوع',
    },
  ];

  const columns = [
    {
      key: 'voucherNumber',
      header: 'رقم السند',
      render: (item: Voucher) => (
        <span className="font-mono font-semibold text-primary-600">{item.voucherNumber}</span>
      ),
    },
    {
      key: 'date',
      header: 'التاريخ',
    },
    {
      key: 'recipient',
      header: activeTab === 'payment' ? 'المستفيد' : 'العميل',
    },
    {
      key: 'description',
      header: 'البيان',
    },
    {
      key: 'amount',
      header: 'المبلغ',
      render: (item: Voucher) => (
        <span className="font-bold text-gray-900">
          {item.amount.toLocaleString('ar-EG')} ج.م
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'طريقة الدفع',
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (item: Voucher) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          item.status === 'مدفوع' 
            ? 'bg-green-100 text-green-700' 
            : item.status === 'معلق'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      render: (item: Voucher) => (
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const currentData = activeTab === 'payment' ? paymentVouchers : receiptVouchers;
  const totalAmount = currentData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي {activeTab === 'payment' ? 'المصروفات' : 'المقبوضات'}</p>
              <p className="text-3xl font-bold text-gray-900">{totalAmount.toLocaleString('ar-EG')} ج.م</p>
            </div>
            <div className={`p-4 rounded-full ${activeTab === 'payment' ? 'bg-red-100' : 'bg-green-100'}`}>
              <svg className={`w-8 h-8 ${activeTab === 'payment' ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">عدد السندات</p>
              <p className="text-3xl font-bold text-gray-900">{currentData.length}</p>
            </div>
            <div className="p-4 rounded-full bg-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">السندات المعلقة</p>
              <p className="text-3xl font-bold text-gray-900">
                {currentData.filter(v => v.status === 'معلق').length}
              </p>
            </div>
            <div className="p-4 rounded-full bg-yellow-100">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'payment'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              سندات الصرف
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'receipt'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              سندات القبض
            </button>
          </div>

          <Button variant="primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            سند جديد
          </Button>
        </div>

        {/* Table */}
        <Table
          data={currentData}
          columns={columns}
          hoverable
          striped
        />
      </Card>
    </div>
  );
};
