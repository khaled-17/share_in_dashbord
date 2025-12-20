import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { supplierService } from '../../services/suppliers';
import type { Supplier } from '../../services/suppliers';
import type { Expense } from '../../services/finance';

import { useParams, useNavigate } from 'react-router-dom';

export const SupplierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const supplierId = id || '';
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: '',
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    secondary_phone: '',
    address: '',
    speciality: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await supplierService.getById(supplierId);

      setSupplier(data);
      setExpenses(data.expenses || []);

      // Sync form data
      setFormData({
        supplier_id: data.supplier_id,
        name: data.name,
        contact_person: data.contact_person || '',
        email: data.email || '',
        phone: data.phone || '',
        secondary_phone: data.secondary_phone || '',
        address: data.address || '',
        speciality: data.speciality || '',
      });
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) {
      fetchData();
    }
  }, [supplierId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('اسم المورد مطلوب');
      return;
    }

    const loadingToast = toast.loading('جاري تحديث البيانات...');
    try {
      const payload = {
        name: formData.name.trim(),
        contact_person: formData.contact_person.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        secondary_phone: formData.secondary_phone.trim() || null,
        address: formData.address.trim() || null,
        speciality: formData.speciality.trim() || null,
      };

      if (supplier) {
        await supplierService.update(supplier.id, payload);
        toast.success('تم التحديث بنجاح', { id: loadingToast });
        setShowEditModal(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || 'فشل التحديث', { id: loadingToast });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const expenseColumns = [
    { key: 'exp_date', header: 'التاريخ', render: (e: Expense) => formatDate(e.exp_date) },
    { key: 'amount', header: 'المبلغ', render: (e: Expense) => formatAmount(e.amount) },
    { key: 'type', header: 'النوع', render: (e: any) => e.type?.exptype_name || e.exptype_id },
    { key: 'receipt_no', header: 'رقم الإيصال' },
    { key: 'notes', header: 'ملاحظات' },
  ];

  if (isLoading) return <div className="text-center py-20">جاري التحميل...</div>;
  if (!supplier) return <div className="text-center py-20 text-red-500">لم يتم العثور على المورد</div>;

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <Toaster position="top-center" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/suppliers')}>عودة للقائمة</Button>
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
        </div>
        <Button onClick={() => setShowEditModal(true)} variant="outline">
          تعديل البيانات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <Card title="بيانات المورد" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">كود المورد</p>
              <p className="font-bold">{supplier.supplier_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">اسم المسؤول</p>
              <p className="font-bold">{supplier.contact_person || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">التخصص</p>
              <p className="font-bold">{supplier.speciality || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">رقم الهاتف</p>
              <p className="font-bold">{supplier.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">رقم هاتف إضافي</p>
              <p className="font-bold">{supplier.secondary_phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الايميل</p>
              <p className="font-bold">{supplier.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">العنوان</p>
              <p className="font-bold">{supplier.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ التكويد</p>
              <p className="font-bold">{supplier.created_at ? formatDate(supplier.created_at) : '-'}</p>
            </div>
          </div>
        </Card>

        {/* Content Tabs Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-sm text-red-600">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-800">{formatAmount(totalExpenses)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-600">عدد العمليات المحاسبية</p>
              <p className="text-2xl font-bold text-blue-800">{expenses.length}</p>
            </div>
          </div>

          <Card title="سجل المصروفات">
            <Table columns={expenseColumns} data={expenses} emptyMessage="لا يوجد سجل مصروفات لهذا المورد" />
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل بيانات المورد"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="كود المورد"
              value={formData.supplier_id}
              disabled
            />
            <Input
              label="اسم المورد *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="اسم المسئول"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            />
            <Input
              label="الايميل"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="رقم الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="رقم هاتف إضافي"
              value={formData.secondary_phone}
              onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })}
            />
            <Input
              label="التخصص"
              value={formData.speciality}
              onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
            />
            <div className="md:col-span-1">
              <Input
                label="العنوان"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>إلغاء</Button>
            <Button type="submit">تحديث البيانات</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
