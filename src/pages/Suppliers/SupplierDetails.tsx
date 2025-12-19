import React, { useState, useEffect } from 'react';
import { Card, Button, Table } from '../../components/ui';
import toast from 'react-hot-toast';
import { financeService } from '../../services/finance';
import type { Expense } from '../../services/finance';
import { supplierService } from '../../services/suppliers';
import type { Supplier } from '../../services/suppliers';

import { useParams, useNavigate } from 'react-router-dom';

export const SupplierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const supplierId = id || '';
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [allSuppliers, allExpenses] = await Promise.all([
          supplierService.getAll(),
          financeService.getAllExpenses()
        ]);

        // Find supplier
        const foundSupplier = allSuppliers?.find(s => s.supplier_id === supplierId);
        if (foundSupplier) {
          setSupplier(foundSupplier);
        } else {
          setSupplier(null);
        }

        // Filter expenses
        const supplierExpenses = allExpenses?.filter(e => e.supplier_id === supplierId) || [];
        // Sort by date desc
        supplierExpenses.sort((a, b) => new Date(b.exp_date).getTime() - new Date(a.exp_date).getTime());

        setExpenses(supplierExpenses);

      } catch (err: any) {
        toast.error('فشل في تحميل البيانات: ' + err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (supplierId) {
      fetchData();
    }
  }, [supplierId]);

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
      key: 'exp_date',
      label: 'التاريخ',
      header: 'التاريخ',
      render: (expense: Expense) => formatDate(expense.exp_date)
    },
    {
      key: 'amount',
      label: 'المبلغ',
      header: 'المبلغ',
      render: (expense: Expense) => formatAmount(expense.amount)
    },
    {
      key: 'type',
      label: 'النوع',
      header: 'النوع',
      render: (expense: Expense) => {
        return (expense as any).type?.exptype_name || expense.exptype_id || (expense as any).expense_types?.exptype_name;
      }
    },
    { key: 'receipt_no', label: 'رقم الإيصال', header: 'رقم الإيصال' },
    { key: 'notes', label: 'ملاحظات', header: 'ملاحظات' },
  ];

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!supplier) {
    return <div className="text-center py-8 text-red-500">لم يتم العثور على المورد</div>;
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={() => navigate('/suppliers')}>
          ← عودة للقائمة
        </Button>
      </div>

      <Card title={`ملف المورد: ${supplier.name}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 mb-1">كود المورد</p>
            <p className="font-semibold">{supplier.supplier_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
            <p className="font-semibold">{supplier.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">التخصص</p>
            <p className="font-semibold">{supplier.speciality || '-'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">ملخص مالي</h3>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg inline-block">
            <p className="text-sm text-red-700 mb-1">إجمالي المصروفات</p>
            <p className="text-2xl font-bold text-red-800">{formatAmount(totalExpenses)}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">سجل العمليات</h3>
        <Table
          columns={columns}
          data={expenses}
          emptyMessage="لا يوجد عمليات لهذا المورد"
        />
      </Card>
    </div>
  );
};
