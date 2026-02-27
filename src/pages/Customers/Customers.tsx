import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Input, Modal } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { customerService } from '../../services/customers';
import type { Customer } from '../../services/customers';
import { Link, useNavigate } from 'react-router-dom';

export const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    contact_person: '',
    company_email: '',
    contact_email: '',
    phone: '',
    secondary_phone: '',
    address: ''
  });
  const [showModal, setShowModal] = useState(false);

  // Generate next customer ID
  const generateNextId = () => {
    if (!Array.isArray(customers) || customers.length === 0) return 'C00001';
    const validIds = customers
      .map(c => c.customer_id)
      .filter(id => typeof id === 'string' && /^C\d+$/.test(id))
      .map(id => parseInt(id.substring(1)))
      .filter(num => !isNaN(num));
    if (validIds.length === 0) return 'C00001';
    const maxId = Math.max(...validIds);
    return 'C' + (maxId + 1).toString().padStart(5, '0');
  };

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await customerService.getAll({ page, limit, search: debouncedSearch });
      setCustomers(res.data || []);
      if (res.pagination) {
        setTotal(res.pagination.total);
      } else {
        setTotal(res.data?.length || 0);
      }
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      setCustomers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      customer_id: generateNextId(),
      name: '',
      contact_person: '',
      company_email: '',
      contact_email: '',
      phone: '',
      secondary_phone: '',
      address: ''
    });
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setIsEditing(true);
    setCurrentId(customer.customer_id);
    setFormData({
      customer_id: customer.customer_id,
      name: customer.name,
      contact_person: customer.contact_person || '',
      company_email: customer.company_email || '',
      contact_email: customer.contact_email || '',
      phone: customer.phone || '',
      secondary_phone: customer.secondary_phone || '',
      address: customer.address || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('اسم الشركة مطلوب');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');
    try {
      const payload = {
        name: formData.name.trim(),
        contact_person: formData.contact_person.trim(),
        company_email: formData.company_email.trim(),
        contact_email: formData.contact_email.trim(),
        phone: formData.phone.trim(),
        secondary_phone: formData.secondary_phone.trim(),
        address: formData.address.trim(),
      };

      if (isEditing && currentId) {
        await customerService.update(currentId, payload);
        toast.success('تم تحديث العميل بنجاح', { id: loadingToast });
      } else {
        await customerService.create({
          customer_id: formData.customer_id.trim(),
          ...payload
        });
        toast.success('تم إضافة العميل بنجاح', { id: loadingToast });
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message || 'فشل في العملية', { id: loadingToast });
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    const loadingToast = toast.loading('جاري الحذف...');
    try {
      await customerService.delete(customerId);
      toast.success('تم الحذف بنجاح', { id: loadingToast });
      fetchCustomers();
    } catch (err: any) {
      toast.error('فشل الحذف: ' + err.message, { id: loadingToast });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'اسم الشركة',
      render: (c: Customer) => (
        <Link to={`/customers/${c.customer_id}`} className="font-bold text-blue-600 hover:underline">{c.name}</Link>
      )
    },
    {
      key: 'contact_person',
      header: 'اسم العميل (المسؤول)',
      render: (c: Customer) => c.contact_person || 'لا يوجد مسؤول'
    },
    { key: 'phone', header: 'رقم الهاتف' },
    { key: 'address', header: 'العنوان' },
    {
      key: 'customer_id',
      header: 'كود العميل',
      align: 'center' as const,
      width: '100px'
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      align: 'left' as const,
      render: (c: Customer) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(c); }}>تعديل</Button>
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/customers/${c.customer_id}`); }}>تفاصيل</Button>
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(c.customer_id); }}>حذف</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
          <p className="text-gray-500">مشاهدة وإدارة جميع بيانات العملاء في النظام</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          إضافة عميل جديد
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            placeholder="بحث بالاسم، الكود، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">جاري تحميل العملاء...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={customers}
              emptyMessage={debouncedSearch ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد عملاء مضافين بعد'}
              onRowClick={(c) => navigate(`/customers/${c.customer_id}`)}
            />
            {total > limit && (
              <div className="flex justify-between items-center mt-4 border-t pt-4">
                <span className="text-sm text-gray-500">
                  إجمالي {total} عميل
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-700">
                    صفحة {page} من {Math.ceil(total / limit)}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="كود العميل *"
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              disabled={isEditing}
              required
            />
            <Input
              label="اسم الشركة *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: شركة النور للتجارة"
              required
            />
            <Input
              label="اسم المسئول"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder="اسم الشخص المسئول عن التواصل"
            />
            <Input
              label="ايميل الشركة"
              type="email"
              value={formData.company_email}
              onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
              placeholder="company@example.com"
            />
            <Input
              label="ايميل المسئول"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="person@example.com"
            />
            <Input
              label="رقم الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01XXXXXXXXX"
            />
            <Input
              label="رقم هاتف إضافي"
              value={formData.secondary_phone}
              onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })}
              placeholder="01XXXXXXXXX"
            />
            <div className="md:col-span-2">
              <Input
                label="العنوان"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان الكامل"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>إلغاء</Button>
            <Button type="submit">{isEditing ? 'تحديث البيانات' : 'إضافة العميل'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
