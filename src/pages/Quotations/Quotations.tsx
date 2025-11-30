import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Table, Input, Select } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface Quotation {
  id: number;
  quotationNumber: string;
  date: string;
  clientName: string;
  customer_id: string;
  totalAmount: number;
  status: 'مسودة' | 'مرسل' | 'مقبول' | 'مرفوض';
  validUntil: string;
  itemsCount: number;
}

interface Customer {
  customer_id: string;
  name: string;
}

interface Supplier {
  supplier_id: string;
  name: string;
}

export const Quotations: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    supplier_id: '',
    event_name: '',
    quote_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    totalamount: '',
    paid_adv: '',
    adv_date: '',
    receipt_no: '',
    status: 'مسودة'
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch quotations
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select(`
          *,
          customers (name),
          suppliers (name)
        `)
        .order('quote_date', { ascending: false });

      if (quotationsError && quotationsError.code !== '42P01') {
        throw quotationsError;
      }

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('customer_id, name')
        .order('name', { ascending: true });

      if (customersError) throw customersError;

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('supplier_id, name')
        .order('name', { ascending: true });

      if (suppliersError) throw suppliersError;

      // Transform quotations data
      const transformedData: Quotation[] = (quotationsData || []).map(item => ({
        id: item.id,
        quotationNumber: item.quote_id ? `QUO-${String(item.quote_id).padStart(4, '0')}` : `QUO-${String(item.id).padStart(4, '0')}`,
        date: item.quote_date || new Date().toISOString().split('T')[0],
        clientName: (item.customers as any)?.name || 'غير محدد',
        customer_id: item.customer_id,
        totalAmount: item.totalamount || 0,
        status: item.status || 'مسودة',
        validUntil: item.delivery_date || '',
        itemsCount: 0,
      }));

      setQuotations(transformedData);
      setCustomers(customersData || []);
      setSuppliers(suppliersData || []);
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

  // Open form for new quotation
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
      setFormData({
        customer_id: customers.length > 0 ? customers[0].customer_id : '',
        supplier_id: suppliers.length > 0 ? suppliers[0].supplier_id : '',
        event_name: '',
        quote_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        totalamount: '',
        paid_adv: '',
        adv_date: '',
        receipt_no: '',
        status: 'مسودة'
      });
    }
  };

  // Submit form (add or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.totalamount) {
      toast.error('العميل والمبلغ الإجمالي مطلوبان');
      return;
    }

    const totalAmount = parseFloat(formData.totalamount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast.error('المبلغ يجب أن يكون رقماً موجباً');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

    try {
      const dataToSubmit = {
        customer_id: formData.customer_id,
        supplier_id: formData.supplier_id || null,
        event_name: formData.event_name || null,
        quote_date: formData.quote_date,
        delivery_date: formData.delivery_date || null,
        totalamount: totalAmount,
        paid_adv: formData.paid_adv ? parseFloat(formData.paid_adv) : null,
        adv_date: formData.adv_date || null,
        receipt_no: formData.receipt_no || null,
        status: formData.status,
      };

      if (isEditing && currentId !== null) {
        const { error } = await supabase
          .from('quotations')
          .update(dataToSubmit)
          .eq('id', currentId);

        if (error) throw error;
        toast.success('تم تحديث عرض السعر بنجاح', { id: loadingToast });
      } else {
        const { error } = await supabase
          .from('quotations')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success('تم إضافة عرض السعر بنجاح', { id: loadingToast });
      }

      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        customer_id: customers[0]?.customer_id || '',
        supplier_id: suppliers[0]?.supplier_id || '',
        event_name: '',
        quote_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        totalamount: '',
        paid_adv: '',
        adv_date: '',
        receipt_no: '',
        status: 'مسودة'
      });
      await fetchData();
    } catch (err: any) {
      toast.error('حدث خطأ: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Edit quotation
  const handleEdit = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setIsEditing(true);
      setCurrentId(id);
      setFormData({
        customer_id: data.customer_id || '',
        supplier_id: data.supplier_id || '',
        event_name: data.event_name || '',
        quote_date: data.quote_date || '',
        delivery_date: data.delivery_date || '',
        totalamount: data.totalamount?.toString() || '',
        paid_adv: data.paid_adv?.toString() || '',
        adv_date: data.adv_date || '',
        receipt_no: data.receipt_no || '',
        status: data.status || 'مسودة'
      });
      setShowForm(true);
    } catch (err: any) {
      toast.error('فشل في تحميل بيانات عرض السعر: ' + err.message);
    }
  };

  // Delete quotation
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف عرض السعر هذا؟')) return;

    const loadingToast = toast.loading('جاري الحذف...');

    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('تم حذف عرض السعر بنجاح', { id: loadingToast });
      await fetchData();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // View quotation details
  const handleView = (item: Quotation) => {
    // For now, show details in a toast
    toast(`عرض السعر: ${item.quotationNumber}\nالعميل: ${item.clientName}\nالمبلغ: ${item.totalAmount} ج.م\nالحالة: ${item.status}`);
  };

  // Print quotation
  const handlePrint = (item: Quotation) => {
    toast('جاري تجهيز الطباعة...');
    // TODO: Implement print functionality
    setTimeout(() => {
      toast.success('يمكنك الآن طباعة عرض السعر');
    }, 1000);
  };

  // Send quotation
  const handleSend = async (id: number) => {
    const loadingToast = toast.loading('جاري إرسال عرض السعر...');

    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: 'مرسل' })
        .eq('id', id);

      if (error) throw error;

      toast.success('تم إرسال عرض السعر بنجاح', { id: loadingToast });
      await fetchData();
    } catch (err: any) {
      toast.error('فشل في إرسال عرض السعر: ' + err.message, { id: loadingToast });
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      customer_id: customers[0]?.customer_id || '',
      supplier_id: suppliers[0]?.supplier_id || '',
      event_name: '',
      quote_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      totalamount: '',
      paid_adv: '',
      adv_date: '',
      receipt_no: '',
      status: 'مسودة'
    });
  };

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
      render: (item: Quotation) => new Date(item.date).toLocaleDateString('ar-EG'),
    },
    {
      key: 'clientName',
      header: 'اسم العميل',
      render: (item: Quotation) => (
        <Link
          to={`/customers/${item.customer_id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {item.clientName}
        </Link>
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
      header: 'تاريخ التسليم',
      render: (item: Quotation) => item.validUntil ? new Date(item.validUntil).toLocaleDateString('ar-EG') : '-',
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (item: Quotation) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'مقبول'
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
      render: (item: Quotation) => (
        <div className="flex gap-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="عرض"
            onClick={() => handleView(item)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="تعديل"
            onClick={() => handleEdit(item.id)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="طباعة"
            onClick={() => handlePrint(item)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="إرسال"
            onClick={() => handleSend(item.id)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="حذف"
            onClick={() => handleDelete(item.id)}
          >
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

  const customerOptions = customers.map(c => ({ value: c.customer_id, label: c.name }));
  const supplierOptions = suppliers.map(s => ({ value: s.supplier_id, label: s.name }));
  const statusOptions = [
    { value: 'مسودة', label: 'مسودة' },
    { value: 'مرسل', label: 'مرسل' },
    { value: 'مقبول', label: 'مقبول' },
    { value: 'مرفوض', label: 'مرفوض' },
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
            <Button
              variant="primary"
              onClick={() => {
                if (!showForm) handleOpenForm();
                else setShowForm(false);
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'إخفاء النموذج' : 'عرض سعر جديد'}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? 'تعديل عرض سعر' : 'إضافة عرض سعر جديد'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="العميل *"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  options={customerOptions}
                  required
                />
                <Select
                  label="المورد"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  options={supplierOptions}
                />
                <Input
                  label="اسم المناسبة"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  placeholder="مثال: حفل زفاف"
                />
                <Input
                  label="تاريخ العرض *"
                  type="date"
                  value={formData.quote_date}
                  onChange={(e) => setFormData({ ...formData, quote_date: e.target.value })}
                  required
                />
                <Input
                  label="تاريخ التسليم"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                />
                <Input
                  label="المبلغ الإجمالي *"
                  type="number"
                  step="0.01"
                  value={formData.totalamount}
                  onChange={(e) => setFormData({ ...formData, totalamount: e.target.value })}
                  placeholder="0.00"
                  required
                />
                <Input
                  label="المبلغ المدفوع مقدماً"
                  type="number"
                  step="0.01"
                  value={formData.paid_adv}
                  onChange={(e) => setFormData({ ...formData, paid_adv: e.target.value })}
                  placeholder="0.00"
                />
                <Input
                  label="تاريخ الدفعة المقدمة"
                  type="date"
                  value={formData.adv_date}
                  onChange={(e) => setFormData({ ...formData, adv_date: e.target.value })}
                />
                <Input
                  label="رقم الإيصال"
                  value={formData.receipt_no}
                  onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
                  placeholder="اختياري"
                />
                <Select
                  label="الحالة"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={statusOptions}
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
          ) : quotations.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عروض أسعار</h3>
                <p className="text-gray-600 mb-4">
                  لم يتم إنشاء أي عروض أسعار بعد. ابدأ بإضافة عرض سعر جديد.
                </p>
              </div>
            </div>
          ) : (
            <Table
              data={quotations}
              columns={columns}
              hoverable
              striped
            />
          )}
        </Card>
      </div>
    </>
  );
};
