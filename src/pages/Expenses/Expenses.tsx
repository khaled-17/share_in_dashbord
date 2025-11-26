import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Select } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface Expense {
  id: number;
  exp_date: string;
  amount: number;
  receipt_no: string;
  quote_id: number | null;
  supplier_id: string;
  exptype_id: string;
  notes: string;
  suppliers?: { name: string };
  expense_types?: { exptype_name: string };
}

interface Supplier {
  supplier_id: string;
  name: string;
}

interface ExpenseType {
  exptype_id: string;
  exptype_name: string;
}

import { Link } from 'react-router-dom';

export const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    exp_date: new Date().toISOString().split('T')[0],
    amount: '',
    receipt_no: '',
    supplier_id: '',
    exptype_id: '',
    quote_id: '',
    notes: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch expenses with related data
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          suppliers (name),
          expense_types (exptype_name)
        `)
        .order('exp_date', { ascending: false });

      if (expensesError) throw expensesError;
      
      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('supplier_id, name')
        .order('name', { ascending: true });

      if (suppliersError) throw suppliersError;

      // Fetch expense types
      const { data: typesData, error: typesError } = await supabase
        .from('expense_types')
        .select('exptype_id, exptype_name')
        .order('exptype_name', { ascending: true });

      if (typesError) throw typesError;

      setExpenses(expensesData || []);
      setSuppliers(suppliersData || []);
      setExpenseTypes(typesData || []);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open form for new expense
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
      setFormData({
        exp_date: new Date().toISOString().split('T')[0],
        amount: '',
        receipt_no: '',
        supplier_id: suppliers.length > 0 ? suppliers[0].supplier_id : '',
        exptype_id: expenseTypes.length > 0 ? expenseTypes[0].exptype_id : '',
        quote_id: '',
        notes: ''
      });
    }
  };

  // Add or update expense
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.exp_date || !formData.amount || !formData.supplier_id || !formData.exptype_id) {
      toast.error('التاريخ والمبلغ والمورد ونوع المصروف مطلوبة');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('المبلغ يجب أن يكون رقماً موجباً');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

    try {
      if (isEditing && currentId !== null) {
        // Update existing expense
        const { error: updateError } = await supabase
          .from('expenses')
          .update({
            exp_date: formData.exp_date,
            amount: amount,
            receipt_no: formData.receipt_no || null,
            supplier_id: formData.supplier_id,
            exptype_id: formData.exptype_id,
            quote_id: formData.quote_id ? parseInt(formData.quote_id) : null,
            notes: formData.notes || null,
          })
          .eq('id', currentId);

        if (updateError) throw updateError;
        
        toast.success('تم تحديث المصروف بنجاح', { id: loadingToast });
      } else {
        // Insert new expense
        const { error: insertError } = await supabase
          .from('expenses')
          .insert([{
            exp_date: formData.exp_date,
            amount: amount,
            receipt_no: formData.receipt_no || null,
            supplier_id: formData.supplier_id,
            exptype_id: formData.exptype_id,
            notes: formData.notes || null,
            quote_id: formData.quote_id ? parseInt(formData.quote_id) : null
          }]);

        if (insertError) throw insertError;
        
        toast.success('تم إضافة المصروف بنجاح', { id: loadingToast });
      }

      // Reset form and refresh data
      setFormData({ 
        exp_date: new Date().toISOString().split('T')[0],
        amount: '',
        receipt_no: '',
        supplier_id: suppliers[0]?.supplier_id || '',
        exptype_id: expenseTypes[0]?.exptype_id || '',
        quote_id: '',
        notes: ''
      });
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      await fetchData();
    } catch (err: any) {
      toast.error('حدث خطأ: ' + (err.message || 'غير معروف'), { id: loadingToast });
      console.error(err);
    }
  };

  // Edit expense
  const handleEdit = (expense: Expense) => {
    setIsEditing(true);
    setCurrentId(expense.id);
    setFormData({
      exp_date: expense.exp_date,
      amount: expense.amount.toString(),
      receipt_no: expense.receipt_no || '',
      supplier_id: expense.supplier_id,
      exptype_id: expense.exptype_id,
      quote_id: expense.quote_id ? expense.quote_id.toString() : '',
      notes: expense.notes || '',
    });
    setShowForm(true);
  };

  // Delete expense
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;

    const loadingToast = toast.loading('جاري الحذف...');

    try {
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('تم حذف المصروف بنجاح', { id: loadingToast });
      await fetchData();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ 
      exp_date: new Date().toISOString().split('T')[0],
      amount: '',
      receipt_no: '',
      supplier_id: suppliers[0]?.supplier_id || '',
      exptype_id: expenseTypes[0]?.exptype_id || '',
      quote_id: '',
      notes: ''
    });
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
  };

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

  // Table columns
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
      key: 'supplier', 
      label: 'المورد', 
      header: 'المورد',
      render: (expense: Expense) => {
        const supplier = suppliers.find(s => s.supplier_id === expense.supplier_id);
        const name = supplier ? supplier.name : expense.supplier_id;
        return (
          <Link 
            to={`/suppliers/${expense.supplier_id}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {name}
          </Link>
        );
      }
    },
    { 
      key: 'type', 
      label: 'النوع', 
      header: 'النوع',
      render: (expense: Expense) => {
        const type = expenseTypes.find(t => t.exptype_id === expense.exptype_id);
        return type ? type.exptype_name : expense.exptype_id;
      }
    },
    { 
      key: 'quote_id', 
      label: 'رقم عرض السعر', 
      header: 'رقم عرض السعر',
      render: (expense: Expense) => expense.quote_id ? `#${expense.quote_id}` : '-'
    },
    { key: 'receipt_no', label: 'رقم الإيصال', header: 'رقم الإيصال' },
    { key: 'notes', label: 'ملاحظات', header: 'ملاحظات' },
    {
      key: 'actions',
      label: 'الإجراءات',
      header: 'الإجراءات',
      render: (expense: Expense) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(expense)}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(expense.id)}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  // Prepare supplier options
  const supplierOptions = suppliers.map(s => ({
    value: s.supplier_id,
    label: s.name
  }));

  // Prepare expense type options
  const expenseTypeOptions = expenseTypes.map(t => ({
    value: t.exptype_id,
    label: t.exptype_name
  }));

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
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
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
        <Card
          title="إدارة المصروفات"
          headerAction={
            <Button onClick={() => {
              if (!showForm) handleOpenForm();
              else setShowForm(false);
            }}>
              {showForm ? 'إخفاء النموذج' : 'إضافة مصروف جديد'}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="التاريخ *"
                  type="date"
                  value={formData.exp_date}
                  onChange={(e) => setFormData({ ...formData, exp_date: e.target.value })}
                  required
                />
                <Input
                  label="المبلغ *"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
                <Select
                  label="المورد *"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  options={supplierOptions}
                  required
                />
                <Select
                  label="نوع المصروف *"
                  value={formData.exptype_id}
                  onChange={(e) => setFormData({ ...formData, exptype_id: e.target.value })}
                  options={expenseTypeOptions}
                  required
                />
                <Input
                  label="رقم عرض السعر"
                  value={formData.quote_id}
                  onChange={(e) => setFormData({ ...formData, quote_id: e.target.value })}
                  placeholder="اختياري"
                  type="number"
                />
                <Input
                  label="رقم الإيصال"
                  value={formData.receipt_no}
                  onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
                  placeholder="اختياري"
                />
                <Input
                  label="ملاحظات"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit">
                  {isEditing ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  إلغاء
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <>
              {suppliers.length === 0 || expenseTypes.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                  ⚠️ يجب إضافة موردين وأنواع مصروفات أولاً قبل إضافة مصروفات
                </div>
              ) : null}
              <Table
                columns={columns}
                data={expenses}
                emptyMessage="لا يوجد مصروفات"
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
};
