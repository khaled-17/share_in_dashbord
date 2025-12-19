import React, { useState, useEffect } from 'react';
import { Card, Button, Table } from '../../components/ui';
import toast from 'react-hot-toast';
import { financeService } from '../../services/finance';
import type { Revenue } from '../../services/finance';
import { customerService } from '../../services/customers';
import type { Customer } from '../../services/customers';

import { useParams, useNavigate } from 'react-router-dom';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = id || '';
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [allCustomers, allRevenues] = await Promise.all([
          customerService.getAll(),
          financeService.getAllRevenue()
        ]);

        // Find customer
        const foundCustomer = allCustomers?.find(c => c.customer_id === customerId);
        if (foundCustomer) {
          setCustomer(foundCustomer);
        } else {
          setCustomer(null);
        }

        // Filter revenues
        const customerRevenues = allRevenues?.filter(r => r.customer_id === customerId) || [];
        // Sort by date desc
        customerRevenues.sort((a, b) => new Date(b.rev_date).getTime() - new Date(a.rev_date).getTime());

        setRevenues(customerRevenues);

      } catch (err: any) {
        toast.error('فشل في تحميل البيانات: ' + err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const columns = [
    {
      key: 'rev_date',
      label: 'التاريخ',
      header: 'التاريخ',
      render: (revenue: Revenue) => formatDate(revenue.rev_date)
    },
    {
      key: 'amount',
      label: 'المبلغ',
      header: 'المبلغ',
      render: (revenue: Revenue) => formatAmount(revenue.amount)
    },
    {
      key: 'type',
      label: 'النوع',
      header: 'النوع',
      render: (revenue: Revenue) => {
        return (revenue as any).type?.revtype_name || revenue.revtype_id || (revenue as any).revenue_types?.revtype_name;
      }
    },
    {
      key: 'quote_id',
      label: 'رقم عرض السعر',
      header: 'رقم عرض السعر',
      render: (revenue: Revenue) => revenue.quote_id ? `#${revenue.quote_id}` : '-'
    },
    { key: 'receipt_no', label: 'رقم الإيصال', header: 'رقم الإيصال' },
    { key: 'notes', label: 'ملاحظات', header: 'ملاحظات' },
  ];

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!customer) {
    return <div className="text-center py-8 text-red-500">لم يتم العثور على العميل</div>;
  }

  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={() => navigate('/customers')}>
          ← عودة للقائمة
        </Button>
      </div>

      <Card title={`ملف العميل: ${customer.name}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 mb-1">رقم العميل</p>
            <p className="font-semibold">{customer.customer_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
            <p className="font-semibold">{customer.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">العنوان</p>
            <p className="font-semibold">{customer.address || '-'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">ملخص مالي</h3>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg inline-block">
            <p className="text-sm text-green-700 mb-1">إجمالي الإيرادات</p>
            <p className="text-2xl font-bold text-green-800">{formatAmount(totalRevenue)}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">سجل العمليات</h3>
        <Table
          columns={columns}
          data={revenues}
          emptyMessage="لا يوجد عمليات لهذا العميل"
        />
      </Card>
    </div>
  );
};
