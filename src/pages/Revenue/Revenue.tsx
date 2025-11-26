import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Select } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface Revenue {
  id: number;
  rev_date: string;
  amount: number;
  receipt_no: string;
  quote_id: number | null;
  customer_id: string;
  revtype_id: string;
  notes: string;
  customers?: { name: string };
  revenue_types?: { revtype_name: string };
}

interface Customer {
  customer_id: string;
  name: string;
}

interface RevenueType {
  revtype_id: string;
  revtype_name: string;
}

import { Link } from 'react-router-dom';

export const Revenue: React.FC = () => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [revenueTypes, setRevenueTypes] = useState<RevenueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    rev_date: new Date().toISOString().split('T')[0],
    amount: '',
    receipt_no: '',
    customer_id: '',
    revtype_id: '',
    quote_id: '',
    notes: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch revenues with related data
      const { data: revenuesData, error: revenuesError } = await supabase
        .from('revenue')
        .select(`
          *,
          customers (name),
          revenue_types (revtype_name)
        `)
        .order('rev_date', { ascending: false });

      if (revenuesError) throw revenuesError;
      
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('customer_id, name')
        .order('name', { ascending: true });

      if (customersError) throw customersError;

      // Fetch revenue types
      const { data: typesData, error: typesError } = await supabase
        .from('revenue_types')
        .select('revtype_id, revtype_name')
        .order('revtype_name', { ascending: true });

      if (typesError) throw typesError;

      setRevenues(revenuesData || []);
      setCustomers(customersData || []);
      setRevenueTypes(typesData || []);
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

  // Open form for new revenue
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
      setFormData({
        rev_date: new Date().toISOString().split('T')[0],
        amount: '',
        receipt_no: '',
        customer_id: customers.length > 0 ? customers[0].customer_id : '',
        revtype_id: revenueTypes.length > 0 ? revenueTypes[0].revtype_id : '',
        quote_id: '',
        notes: ''
      });
    }
  };

  // Add or update revenue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rev_date || !formData.amount || !formData.customer_id || !formData.revtype_id) {
      toast.error('التاريخ والمبلغ والعميل ونوع الإيراد مطلوبة');
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
        // Update existing revenue
        const { error: updateError } = await supabase
          .from('revenue')
          .update({
            rev_date: formData.rev_date,
            amount: amount,
            receipt_no: formData.receipt_no || null,
            customer_id: formData.customer_id,
            revtype_id: formData.revtype_id,
            quote_id: formData.quote_id ? parseInt(formData.quote_id) : null,
            notes: formData.notes || null,
          })
          .eq('id', currentId);

        if (updateError) throw updateError;
        
        toast.success('تم تحديث الإيراد بنجاح', { id: loadingToast });
      } else {
        // Insert new revenue
        const { error: insertError } = await supabase
          .from('revenue')
          .insert([{
            rev_date: formData.rev_date,
            amount: amount,
            receipt_no: formData.receipt_no || null,
            customer_id: formData.customer_id,
            revtype_id: formData.revtype_id,
            notes: formData.notes || null,
            quote_id: formData.quote_id ? parseInt(formData.quote_id) : null
          }]);

        if (insertError) throw insertError;
        
        toast.success('تم إضافة الإيراد بنجاح', { id: loadingToast });
      }

      // Reset form and refresh data
      setFormData({ 
        rev_date: new Date().toISOString().split('T')[0],
        amount: '',
        receipt_no: '',
        customer_id: customers[0]?.customer_id || '',
        revtype_id: revenueTypes[0]?.revtype_id || '',
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

  // Edit revenue
  const handleEdit = (revenue: Revenue) => {
    setIsEditing(true);
    setCurrentId(revenue.id);
    setFormData({
      rev_date: revenue.rev_date,
      amount: revenue.amount.toString(),
      receipt_no: revenue.receipt_no || '',
      customer_id: revenue.customer_id,
      revtype_id: revenue.revtype_id,
      quote_id: revenue.quote_id ? revenue.quote_id.toString() : '',
      notes: revenue.notes || '',
    });
    setShowForm(true);
  };

  // Delete revenue
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإيراد؟')) return;

    const loadingToast = toast.loading('جاري الحذف...');

    try {
      const { error: deleteError } = await supabase
        .from('revenue')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('تم حذف الإيراد بنجاح', { id: loadingToast });
      await fetchData();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ 
      rev_date: new Date().toISOString().split('T')[0],
      amount: '',
      receipt_no: '',
      customer_id: customers[0]?.customer_id || '',
      revtype_id: revenueTypes[0]?.revtype_id || '',
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
      key: 'customer', 
      label: 'العميل', 
      header: 'العميل',
      render: (revenue: Revenue) => {
        const customer = customers.find(c => c.customer_id === revenue.customer_id);
        const name = customer ? customer.name : revenue.customer_id;
        return (
          <Link 
            to={`/customers/${revenue.customer_id}`}
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
      render: (revenue: Revenue) => {
        const type = revenueTypes.find(t => t.revtype_id === revenue.revtype_id);
        return type ? type.revtype_name : revenue.revtype_id;
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
    {
      key: 'actions',
      label: 'الإجراءات',
      header: 'الإجراءات',
      render: (revenue: Revenue) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(revenue)}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(revenue.id)}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  // Prepare customer options
  const customerOptions = customers.map(c => ({
    value: c.customer_id,
    label: c.name
  }));

  // Prepare revenue type options
  const revenueTypeOptions = revenueTypes.map(t => ({
    value: t.revtype_id,
    label: t.revtype_name
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
          title="إدارة الإيرادات"
          headerAction={
            <Button onClick={() => {
              if (!showForm) handleOpenForm();
              else setShowForm(false);
            }}>
              {showForm ? 'إخفاء النموذج' : 'إضافة إيراد جديد'}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? 'تعديل إيراد' : 'إضافة إيراد جديد'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="التاريخ *"
                  type="date"
                  value={formData.rev_date}
                  onChange={(e) => setFormData({ ...formData, rev_date: e.target.value })}
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
                  label="العميل *"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  options={customerOptions}
                  required
                />
                <Select
                  label="نوع الإيراد *"
                  value={formData.revtype_id}
                  onChange={(e) => setFormData({ ...formData, revtype_id: e.target.value })}
                  options={revenueTypeOptions}
                  required
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
              {customers.length === 0 || revenueTypes.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                  ⚠️ يجب إضافة عملاء وأنواع إيرادات أولاً قبل إضافة إيرادات
                </div>
              ) : null}
              <Table
                columns={columns}
                data={revenues}
                emptyMessage="لا يوجد إيرادات"
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
};
