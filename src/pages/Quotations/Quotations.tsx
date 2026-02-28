import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Input, Select, Drawer } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { quotationService, type ProjectType } from '../../services/quotations';
import { customerService, type Customer } from '../../services/customers';

interface QuotationRow {
  id: number;
  quotationNumber: string;
  date: string;
  clientName: string;
  customer_id: string;
  project_name: string;
  project_type_name: string;
  totalAmount: number;
  status: string;
  delivery_date: string;
}

interface Item {
  description: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export const Quotations: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Validation State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customer_id: '',
    project_type_id: '',
    project_manager: '',
    project_name: '',
    quote_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    totalamount: '0',
    paid_adv: '',
    adv_date: '',
    receipt_no: '',
    status: 'مسودة',
    items: [] as Item[]
  });

  // Drawer for Item CRUD
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemFormData, setItemFormData] = useState<Item>({
    description: '',
    unit_price: 0,
    quantity: 1,
    total: 0
  });
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    setFormData(prev => ({ ...prev, totalamount: total.toString() }));
  }, [formData.items]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [quotationsData, customersData, projectTypesData] = await Promise.all([
        quotationService.getAll(),
        customerService.getAll(),
        quotationService.getProjectTypes()
      ]);

      setCustomers(customersData?.data || []);
      setProjectTypes(projectTypesData || []);

      const transformed = (quotationsData || []).map(q => ({
        id: q.id,
        quotationNumber: `QUO-${String(q.id).padStart(4, '0')}`,
        date: q.quote_date,
        clientName: q.customer?.name || 'غير محدد',
        customer_id: q.customer_id,
        project_name: q.project_name || '-',
        project_type_name: q.project_type?.type_name || '-',
        totalAmount: q.totalamount,
        status: q.status,
        delivery_date: q.delivery_date || '-'
      }));

      setQuotations(transformed);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.customer_id) errors.customer_id = 'يرجى اختيار العميل';
    if (!formData.project_type_id) errors.project_type_id = 'يرجى اختيار نوع المشروع';
    if (!formData.project_name.trim()) errors.project_name = 'اسم المشروع مطلوب';
    if (formData.items.length === 0) toast.error('يرجى إضافة بند واحد على الأقل');

    setFormErrors(errors);
    return Object.keys(errors).length === 0 && formData.items.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const loadingToast = toast.loading('جاري الحفظ...');
    try {
      const data = {
        ...formData,
        totalamount: parseFloat(formData.totalamount),
        paid_adv: formData.paid_adv ? parseFloat(formData.paid_adv) : null,
        items: formData.items.map(item => ({
          ...item,
          unit_price: parseFloat(item.unit_price.toString()),
          quantity: parseFloat(item.quantity.toString()),
          total: parseFloat(item.total.toString())
        }))
      };

      if (isEditing && currentId) {
        await quotationService.update(currentId, data);
        toast.success('تم التحديث بنجاح', { id: loadingToast });
      } else {
        await quotationService.create(data);
        toast.success('تمت الإضافة بنجاح', { id: loadingToast });
      }
      handleCancel();
      fetchData();
    } catch (err: any) {
      toast.error('خطأ: ' + err.message, { id: loadingToast });
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const data = await quotationService.getById(id);
      setIsEditing(true);
      setCurrentId(id);
      setFormData({
        customer_id: data.customer_id,
        project_type_id: data.project_type_id || '',
        project_manager: data.project_manager || '',
        project_name: data.project_name || '',
        quote_date: data.quote_date,
        delivery_date: data.delivery_date || '',
        totalamount: data.totalamount.toString(),
        paid_adv: data.paid_adv?.toString() || '',
        adv_date: data.adv_date || '',
        receipt_no: data.receipt_no || '',
        status: data.status,
        items: data.items?.map(i => ({
          description: i.description,
          unit_price: i.unit_price,
          quantity: i.quantity,
          total: i.total
        })) || []
      });
      setShowForm(true);
      setFormErrors({});
    } catch (err: any) {
      toast.error('فشل في التحميل');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف عرض السعر هذا؟')) return;
    try {
      await quotationService.delete(id);
      toast.success('تم الحذف بنجاح');
      fetchData();
    } catch (e) { }
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormErrors({});
    setFormData({
      customer_id: '',
      project_type_id: '',
      project_manager: '',
      project_name: '',
      quote_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      totalamount: '0',
      paid_adv: '',
      adv_date: '',
      receipt_no: '',
      status: 'مسودة',
      items: []
    });
  };

  // Item Management
  const openAddItem = () => {
    setItemFormData({ description: '', unit_price: 0, quantity: 1, total: 0 });
    setEditingItemIndex(null);
    setItemErrors({});
    setIsItemDrawerOpen(true);
  };

  const openEditItem = (index: number) => {
    setItemFormData({ ...formData.items[index] });
    setEditingItemIndex(index);
    setItemErrors({});
    setIsItemDrawerOpen(true);
  };

  const validateItem = () => {
    const errors: Record<string, string> = {};
    if (!itemFormData.description.trim()) errors.description = 'الوصف مطلوب';
    if (itemFormData.unit_price <= 0) errors.unit_price = 'يجب أن يكون السعر أكبر من صفر';
    if (itemFormData.quantity <= 0) errors.quantity = 'يجب أن تكون الكمية أكبر من صفر';

    setItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveItem = () => {
    if (!validateItem()) return;

    const newItem = { ...itemFormData, total: itemFormData.unit_price * itemFormData.quantity };
    const newItems = [...formData.items];

    if (editingItemIndex !== null) {
      newItems[editingItemIndex] = newItem;
    } else {
      newItems.push(newItem);
    }

    setFormData({ ...formData, items: newItems });
    setIsItemDrawerOpen(false);
  };

  const deleteItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const columns = [
    { key: 'quotationNumber', header: 'رقم العرض' },
    { key: 'date', header: 'التاريخ', render: (row: QuotationRow) => new Date(row.date).toLocaleDateString('ar-EG') },
    { key: 'clientName', header: 'العميل' },
    { key: 'project_name', header: 'المشروع' },
    { key: 'project_type_name', header: 'النوع' },
    { key: 'totalAmount', header: 'الإجمالي', render: (row: QuotationRow) => `${row.totalAmount.toLocaleString()} ج.م` },
    { key: 'status', header: 'الحالة' },
    {
      key: 'actions',
      header: 'الإجراءات',
      render: (row: QuotationRow) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/quotations/${row.id}`)}>عرض</Button>
          <Button variant="secondary" size="sm" onClick={() => handleEdit(row.id)}>تعديل</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>حذف</Button>
        </div>
      )
    }
  ];

  const itemColumns = [
    { key: 'description', header: 'الوصف' },
    { key: 'unit_price', header: 'سعر الوحدة', render: (it: Item) => `${it.unit_price.toLocaleString()} ج.م` },
    { key: 'quantity', header: 'الكمية' },
    { key: 'total', header: 'الإجمالي', render: (it: Item) => `${(it.unit_price * it.quantity).toLocaleString()} ج.م` },
    {
      key: 'actions',
      header: 'الإجراءات',
      render: (_: any, index: number) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => openEditItem(index)}>تعديل</Button>
          <Button type="button" variant="danger" size="sm" onClick={() => deleteItem(index)}>حذف</Button>
        </div>
      )
    }
  ];

  const customerOptions = [{ value: '', label: 'اختر العميل' }, ...customers.map(c => ({ value: c.customer_id, label: c.name }))];
  const projectTypeOptions = [{ value: '', label: 'اختر نوع المشروع' }, ...projectTypes.map(p => ({ value: p.type_id, label: p.type_name }))];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <Toaster position="top-center" />
      <Card title="إدارة عروض الأسعار" headerAction={<Button onClick={() => { if (showForm) handleCancel(); else setShowForm(true); }}>{showForm ? 'إلغاء' : 'عرض سعر جديد'}</Button>}>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Input
                label="رقم عرض السعر"
                value={isEditing && currentId ? `QUO-${String(currentId).padStart(4, '0')}` : 'سيتم التوليد تلقائياً'}
                disabled
                className="bg-gray-100 font-bold text-gray-500"
              />
              <Select
                label="العميل *"
                value={formData.customer_id}
                onChange={e => { setFormData({ ...formData, customer_id: e.target.value }); setFormErrors({ ...formErrors, customer_id: '' }) }}
                options={customerOptions}
                error={formErrors.customer_id}
              />
              <Select
                label="نوع المشروع *"
                value={formData.project_type_id}
                onChange={e => { setFormData({ ...formData, project_type_id: e.target.value }); setFormErrors({ ...formErrors, project_type_id: '' }) }}
                options={projectTypeOptions}
                error={formErrors.project_type_id}
              />
              <Input
                label="اسم المشروع *"
                value={formData.project_name}
                onChange={e => { setFormData({ ...formData, project_name: e.target.value }); setFormErrors({ ...formErrors, project_name: '' }) }}
                error={formErrors.project_name}
              />
              <Input label="المسؤول" value={formData.project_manager} onChange={e => setFormData({ ...formData, project_manager: e.target.value })} />
              <Input label="تاريخ العرض" type="date" value={formData.quote_date} onChange={e => setFormData({ ...formData, quote_date: e.target.value })} />
              <Input label="تاريخ التسليم المتوقع" type="date" value={formData.delivery_date} onChange={e => setFormData({ ...formData, delivery_date: e.target.value })} />
              <Select label="الحالة" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'مسودة', label: 'مسودة' }, { value: 'مرسل', label: 'مرسل' }, { value: 'مقبول', label: 'مقبول' }]} />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border">
                <h4 className="font-bold text-lg text-primary-900 text-right">بنود العرض</h4>
                <Button type="button" variant="primary" size="sm" onClick={openAddItem}>+ إضافة بند جديد</Button>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Table
                  data={formData.items}
                  columns={itemColumns as any}
                  emptyMessage="لم يتم إضافة أي بنود بعد. اضغط على (+ إضافة بند جديد) للبدء."
                />
              </div>
            </div>

            <div className="flex justify-between items-center p-6 bg-primary-600 text-white rounded-xl shadow-lg">
              <div className="flex flex-col">
                <span className="text-primary-100 text-sm">إجمالي المبلغ النهائي</span>
                <span className="text-3xl font-black">{parseFloat(formData.totalamount).toLocaleString()} ج.م</span>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="success" size="lg" className="px-8 shadow-inner">
                  {isEditing ? 'تحديث عرض السعر' : 'حفظ عرض السعر جديد'}
                </Button>
                <Button type="button" variant="secondary" size="lg" onClick={handleCancel}>إلغاء</Button>
              </div>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 font-medium">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <Table data={quotations} columns={columns} />
        )}
      </Card>

      {/* Item Management Drawer */}
      <Drawer
        isOpen={isItemDrawerOpen}
        onClose={() => setIsItemDrawerOpen(false)}
        title={editingItemIndex !== null ? 'تعديل بند' : 'إضافة بند جديد'}
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-primary-50 rounded-lg text-primary-800 text-sm mb-4">
            قم بإدخال تفاصيل البند بدقة ليتم احتساب الإجمالي تلقائياً.
          </div>

          <Input
            label="وصف البند *"
            placeholder="مثال: توريد وتركيب شاشات ليد"
            value={itemFormData.description}
            onChange={e => { setItemFormData({ ...itemFormData, description: e.target.value }); setItemErrors({ ...itemErrors, description: '' }) }}
            error={itemErrors.description}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="سعر الوحدة *"
              type="number"
              value={itemFormData.unit_price}
              onChange={e => { setItemFormData({ ...itemFormData, unit_price: parseFloat(e.target.value) || 0 }); setItemErrors({ ...itemErrors, unit_price: '' }) }}
              error={itemErrors.unit_price}
              fullWidth
            />
            <Input
              label="الكمية *"
              type="number"
              value={itemFormData.quantity}
              onChange={e => { setItemFormData({ ...itemFormData, quantity: parseFloat(e.target.value) || 0 }); setItemErrors({ ...itemErrors, quantity: '' }) }}
              error={itemErrors.quantity}
              fullWidth
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center border border-dashed">
            <span className="text-gray-600 font-bold">إجمالي البند:</span>
            <span className="text-2xl font-black text-primary-700">{(itemFormData.unit_price * itemFormData.quantity).toLocaleString()} ج.م</span>
          </div>

          <div className="flex gap-3 pt-6">
            <Button onClick={saveItem} fullWidth>
              {editingItemIndex !== null ? 'تحديث البند' : 'إضافة البند للقائمة'}
            </Button>
            <Button variant="secondary" onClick={() => setIsItemDrawerOpen(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
