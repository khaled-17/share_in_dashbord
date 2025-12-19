import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Table, Input, Select } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { quotationService } from '../../services/quotations';
import { customerService, type Customer } from '../../services/customers';
import { supplierService, type Supplier } from '../../services/suppliers';

interface Quotation {
  id: number;
  quotationNumber: string;
  date: string;
  clientName: string;
  customer_id: string;
  totalAmount: number;
  status: 'مسودة' | 'مرسل' | 'مقبول' | 'مرفوض' | string;
  validUntil: string;
  itemsCount: number;
}

const projectTypeOptions = [
  { value: 'ديجيتال ماركتنج', label: 'ديجيتال ماركتنج' },
  { value: 'ميديا برودكشن', label: 'ميديا برودكشن' },
  { value: 'تنظيم مناسبات', label: 'تنظيم مناسبات' },
  { value: 'تنظيم مؤتمرات', label: 'تنظيم مؤتمرات' },
  { value: 'طباعة بأنواعها', label: 'طباعة بأنواعها' },
  { value: 'هدايا سنوية', label: 'هدايا سنوية' },
];

export const Quotations: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    project_type: 'ديجيتال ماركتنج',
    project_manager: '',
    project_name: '',
    quote_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    totalamount: '0',
    paid_adv: '',
    adv_date: '',
    receipt_no: '',
    status: 'مسودة',
    items: [{ description: '', unit_price: 0, quantity: 1, total: 0 }]
  });

  // Calculate total whenever items change
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    setFormData(prev => ({ ...prev, totalamount: total.toString() }));
  }, [formData.items]);

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [quotationsData, customersData] = await Promise.all([
        quotationService.getAll(),
        customerService.getAll()
      ]);

      const transformedData: Quotation[] = (quotationsData || []).map(item => ({
        id: item.id,
        quotationNumber: `QUO-${String(item.id).padStart(4, '0')}`,
        date: item.quote_date || new Date().toISOString().split('T')[0],
        clientName: item.customer?.name || 'غير محدد',
        customer_id: item.customer_id,
        totalAmount: item.totalamount || 0,
        status: item.status || 'مسودة',
        validUntil: item.delivery_date || '',
        itemsCount: item.items?.length || 0,
      }));

      setQuotations(transformedData);
      setCustomers(customersData || []);
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

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', unit_price: 0, quantity: 1, total: 0 }]
    });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;
    if (field === 'unit_price' || field === 'quantity') {
      newItems[index].total = newItems[index].unit_price * newItems[index].quantity;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Open form for new quotation
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
      setFormData({
        customer_id: customers.length > 0 ? customers[0].customer_id : '',
        project_type: 'ديجيتال ماركتنج',
        project_manager: '',
        project_name: '',
        quote_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        totalamount: '0',
        paid_adv: '',
        adv_date: '',
        receipt_no: '',
        status: 'مسودة',
        items: [{ description: '', unit_price: 0, quantity: 1, total: 0 }]
      });
    }
  };

  // Submit form (add or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.project_name) {
      toast.error('العميل واسم المشروع مطلوبان');
      return;
    }

    const totalAmount = parseFloat(formData.totalamount);

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

    try {
      const dataToSubmit = {
        customer_id: formData.customer_id,
        project_type: formData.project_type,
        project_manager: formData.project_manager,
        project_name: formData.project_name,
        quote_date: formData.quote_date,
        delivery_date: formData.delivery_date || null,
        totalamount: totalAmount,
        paid_adv: formData.paid_adv ? parseFloat(formData.paid_adv) : null,
        adv_date: formData.adv_date || null,
        receipt_no: formData.receipt_no || null,
        status: formData.status,
        items: formData.items.map(item => ({
          description: item.description,
          unit_price: parseFloat(item.unit_price.toString()),
          quantity: parseFloat(item.quantity.toString()),
          total: parseFloat(item.total.toString())
        }))
      };

      if (isEditing && currentId !== null) {
        await quotationService.update(currentId, dataToSubmit);
        toast.success('تم تحديث عرض السعر بنجاح', { id: loadingToast });
      } else {
        await quotationService.create(dataToSubmit);
        toast.success('تم إضافة عرض السعر بنجاح', { id: loadingToast });
      }

      handleCancel();
      await fetchData();
    } catch (err: any) {
      toast.error('حدث خطأ: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Edit quotation
  const handleEdit = async (id: number) => {
    try {
      const data = await quotationService.getById(id);

      setIsEditing(true);
      setCurrentId(id);
      setFormData({
        customer_id: data.customer_id || '',
        project_type: data.project_type || 'ديجيتال ماركتنج',
        project_manager: data.project_manager || '',
        project_name: data.project_name || '',
        quote_date: data.quote_date || '',
        delivery_date: data.delivery_date || '',
        totalamount: data.totalamount?.toString() || '0',
        paid_adv: data.paid_adv?.toString() || '',
        adv_date: data.adv_date || '',
        receipt_no: data.receipt_no || '',
        status: data.status || 'مسودة',
        items: data.items && data.items.length > 0
          ? data.items.map(item => ({
            description: item.description,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total: item.total
          }))
          : [{ description: '', unit_price: 0, quantity: 1, total: 0 }]
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
      await quotationService.delete(id);

      toast.success('تم حذف عرض السعر بنجاح', { id: loadingToast });
      await fetchData();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      customer_id: customers[0]?.customer_id || '',
      project_type: 'ديجيتال ماركتنج',
      project_manager: '',
      project_name: '',
      quote_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      totalamount: '0',
      paid_adv: '',
      adv_date: '',
      receipt_no: '',
      status: 'مسودة',
      items: [{ description: '', unit_price: 0, quantity: 1, total: 0 }]
    });
  };

  const columns = [
    {
      key: 'quotationNumber',
      header: 'رقم العرض',
      render: (item: Quotation) => (
        <Link
          to={`/quotations/${item.id}`}
          className="font-mono font-semibold text-primary-600 hover:underline"
        >
          {item.quotationNumber}
        </Link>
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
            onClick={() => { }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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

  const customerOptions = customers.map(c => ({ value: c.customer_id, label: `${c.name} (${c.customer_id})` }));
  const statusOptions = [
    { value: 'مسودة', label: 'مسودة' },
    { value: 'مرسل', label: 'مرسل' },
    { value: 'مقبول', label: 'مقبول' },
    { value: 'مرفوض', label: 'مرفوض' },
  ];

  return (
    <>
      <Toaster position="top-center" />

      <div className="space-y-6 text-right" dir="rtl">
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
          headerAction={
            <Button
              variant="primary"
              onClick={() => {
                if (!showForm) handleOpenForm();
                else setShowForm(false);
              }}
            >
              {showForm ? 'إخفاء النموذج' : 'عرض سعر جديد'}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-6 border-b pb-2">
                {isEditing ? 'تعديل عرض سعر' : 'إضافة عرض سعر جديد'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Select
                  label="العميل *"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  options={customerOptions}
                  required
                />
                <Select
                  label="نوع المشروع *"
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  options={projectTypeOptions}
                  required
                />
                <Input
                  label="المسؤول عن المشروع"
                  value={formData.project_manager}
                  onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                  placeholder="اسم الشخص المسؤول"
                />
                <Input
                  label="اسم المشروع *"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="مثال: تصوير حملة الشتاء"
                  required
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
                <Select
                  label="الحالة"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={statusOptions}
                />
              </div>

              {/* Items Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold">محتوى عرض السعر</h4>
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
                    + إضافة بند
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="md:col-span-1 text-center font-bold text-gray-400">
                        {index + 1}
                      </div>
                      <div className="md:col-span-5">
                        <Input
                          label="الوصف"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          placeholder="مثال: تصوير ريلز"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="سعر الوحده"
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Input
                          label="العدد"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="الإجمالي"
                          type="number"
                          value={item.total}
                          disabled
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-primary-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <p className="text-sm text-gray-500 mb-1">إجمالي عرض السعر</p>
                    <p className="text-2xl font-bold text-primary-600">{parseFloat(formData.totalamount).toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <Input
                    label="المبلغ المدفوع مقدماً"
                    type="number"
                    value={formData.paid_adv}
                    onChange={(e) => setFormData({ ...formData, paid_adv: e.target.value })}
                  />
                  <Input
                    label="رقم الإيصال"
                    value={formData.receipt_no}
                    onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="lg" className="px-12">
                  {isEditing ? 'تعديل عرض السعر' : 'حفظ عرض السعر'}
                </Button>
                <Button type="button" variant="secondary" size="lg" onClick={handleCancel}>
                  إلغاء
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
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
