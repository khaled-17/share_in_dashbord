import React from 'react';
import { Card, Button, Table } from '../../components/ui';

interface Quotation {
  id: number;
  quotationNumber: string;
  date: string;
  clientName: string;
  totalAmount: number;
  status: 'مسودة' | 'مرسل' | 'مقبول' | 'مرفوض';
  validUntil: string;
  itemsCount: number;
}

export const Quotations: React.FC = () => {
  const quotations: Quotation[] = [
    {
      id: 1,
      quotationNumber: 'QUO-2025-001',
      date: '2025-11-25',
      clientName: 'شركة النور للتجارة',
      totalAmount: 45000,
      status: 'مرسل',
      validUntil: '2025-12-25',
      itemsCount: 5,
    },
    {
      id: 2,
      quotationNumber: 'QUO-2025-002',
      date: '2025-11-23',
      clientName: 'مؤسسة الأمل',
      totalAmount: 32000,
      status: 'مقبول',
      validUntil: '2025-12-23',
      itemsCount: 3,
    },
    {
      id: 3,
      quotationNumber: 'QUO-2025-003',
      date: '2025-11-20',
      clientName: 'شركة المستقبل',
      totalAmount: 28500,
      status: 'مسودة',
      validUntil: '2025-12-20',
      itemsCount: 4,
    },
    {
      id: 4,
      quotationNumber: 'QUO-2025-004',
      date: '2025-11-18',
      clientName: 'مكتب الإبداع',
      totalAmount: 15000,
      status: 'مرفوض',
      validUntil: '2025-12-18',
      itemsCount: 2,
    },
  ];

  const columns = [
    {
      key: 'quotationNumber',
      header: 'رقم العرض',
      render: (item: Quotation) => (
        <span className="font-mono font-semibold text-primary-600">{item.quotationNumber}</span>
      ),
    },
    {
      key: 'date',
      header: 'تاريخ الإصدار',
    },
    {
      key: 'clientName',
      header: 'اسم العميل',
    },
    {
      key: 'itemsCount',
      header: 'عدد الأصناف',
      render: (item: Quotation) => (
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
          {item.itemsCount} صنف
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'المبلغ الإجمالي',
      render: (item: Quotation) => (
        <span className="font-bold text-gray-900">
          {item.totalAmount.toLocaleString('ar-EG')} ج.م
        </span>
      ),
    },
    {
      key: 'validUntil',
      header: 'صالح حتى',
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (item: Quotation) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          item.status === 'مقبول' 
            ? 'bg-green-100 text-green-700' 
            : item.status === 'مرسل'
            ? 'bg-blue-100 text-blue-700'
            : item.status === 'مسودة'
            ? 'bg-gray-100 text-gray-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      render: (_item: Quotation) => (
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="عرض">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="تعديل">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="طباعة">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="إرسال">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: quotations.length,
    accepted: quotations.filter(q => q.status === 'مقبول').length,
    sent: quotations.filter(q => q.status === 'مرسل').length,
    draft: quotations.filter(q => q.status === 'مسودة').length,
    totalValue: quotations.reduce((sum, q) => sum + q.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card hover>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">إجمالي العروض</p>
            <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
          </div>
        </Card>

        <Card hover>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">عروض مقبولة</p>
            <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
          </div>
        </Card>

        <Card hover>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">عروض مرسلة</p>
            <p className="text-3xl font-bold text-blue-600">{stats.sent}</p>
          </div>
        </Card>

        <Card hover>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">مسودات</p>
            <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
          </div>
        </Card>

        <Card hover>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">القيمة الإجمالية</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalValue.toLocaleString('ar-EG')}
            </p>
            <p className="text-xs text-gray-500">جنيه مصري</p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card
        title="عروض الأسعار"
        subtitle="إدارة ومتابعة جميع عروض الأسعار المقدمة للعملاء"
        headerAction={
          <Button variant="primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            عرض سعر جديد
          </Button>
        }
      >
        <Table
          data={quotations}
          columns={columns}
          hoverable
          striped
        />
      </Card>
    </div>
  );
};
