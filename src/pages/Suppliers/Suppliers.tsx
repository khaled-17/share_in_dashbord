import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Table, Input, Modal } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { supplierService } from '../../services/suppliers';
import type { Supplier } from '../../services/suppliers';
import { Link, useNavigate } from 'react-router-dom';

export const Suppliers: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
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
  const [showModal, setShowModal] = useState(false);

  // Filtered suppliers based on search
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;
    const term = searchTerm.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.supplier_id.toLowerCase().includes(term) ||
      (s.phone && s.phone.includes(term)) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(term)) ||
      (s.speciality && s.speciality.toLowerCase().includes(term))
    );
  }, [suppliers, searchTerm]);

  // Generate next supplier ID
  const generateNextId = () => {
    if (suppliers.length === 0) return 'S001';
    const validIds = suppliers
      .map(s => s.supplier_id)
      .filter(id => /^S\d+$/.test(id))
      .map(id => parseInt(id.substring(1)))
      .filter(num => !isNaN(num));
    if (validIds.length === 0) return 'S001';
    const maxId = Math.max(...validIds);
    return 'S' + (maxId + 1).toString().padStart(3, '0');
  };

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data || []);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      supplier_id: generateNextId(),
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      secondary_phone: '',
      address: '',
      speciality: ''
    });
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setIsEditing(true);
    setCurrentId(supplier.id);
    setFormData({
      supplier_id: supplier.supplier_id,
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      secondary_phone: supplier.secondary_phone || '',
      address: supplier.address || '',
      speciality: supplier.speciality || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('اسم المورد مطلوب');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');
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

      if (isEditing && currentId !== null) {
        await supplierService.update(currentId, payload);
        toast.success('تم تحديث بيانات المورد بنجاح', { id: loadingToast });
      } else {
        await supplierService.create({
          supplier_id: formData.supplier_id.trim(),
          ...payload
        });
        toast.success('تم إضافة المورد بنجاح', { id: loadingToast });
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.message || 'فشل في العملية', { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    const loadingToast = toast.loading('جاري الحذف...');
    try {
      await supplierService.delete(id);
      toast.success('تم الحذف بنجاح', { id: loadingToast });
      fetchSuppliers();
    } catch (err: any) {
      toast.error('فشل الحذف: ' + err.message, { id: loadingToast });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'اسم المورد',
      render: (s: Supplier) => (
        <Link to={`/suppliers/${s.supplier_id}`} className="font-bold text-blue-600 hover:underline">{s.name}</Link>
      )
    },
    {
      key: 'contact_person',
      header: 'المسؤول',
      render: (s: Supplier) => s.contact_person || 'غير محدد'
    },
    { key: 'phone', header: 'رقم الهاتف' },
    { key: 'speciality', header: 'التخصص' },
    {
      key: 'supplier_id',
      header: 'كود المورد',
      align: 'center' as const,
      width: '100px'
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      align: 'left' as const,
      render: (s: Supplier) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(s); }}>تعديل</Button>
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/${s.supplier_id}`); }}>تفاصيل</Button>
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>حذف</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين</h1>
          <p className="text-gray-500">مشاهدة وإدارة جميع بيانات الموردين في النظام</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          إضافة مورد جديد
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            placeholder="بحث بالاسم، الكود، التخصص، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">جاري تحميل الموردين...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredSuppliers}
            emptyMessage={searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد موردين مضافين بعد'}
            onRowClick={(s) => navigate(`/suppliers/${s.supplier_id}`)}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="كود المورد *"
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              disabled={isEditing}
              required
            />
            <Input
              label="اسم المورد / الشركة *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="اسم الشركة"
              required
            />
            <Input
              label="اسم المسئول"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder="الاسم"
            />
            <Input
              label="ايميل المورد"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="supplier@example.com"
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
            <Input
              label="التخصص"
              value={formData.speciality}
              onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
              placeholder="مثال: صيانة، توريد أخشاب"
            />
            <div className="md:col-span-1">
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
            <Button type="submit">{isEditing ? 'تحديث البيانات' : 'إضافة المورد'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
