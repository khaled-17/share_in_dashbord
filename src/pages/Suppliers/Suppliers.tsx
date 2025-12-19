import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { supplierService } from '../../services/suppliers';
import type { Supplier } from '../../services/suppliers';
import { Link } from 'react-router-dom';

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    name: '', // اسم الشركة
    contact_person: '', // اسم المسئول أو صاحب الشركة
    email: '',
    phone: '',
    secondary_phone: '',
    address: '',
    speciality: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Generate next supplier ID
  const generateNextId = () => {
    if (suppliers.length === 0) return 'S001';

    // Filter suppliers with valid format (S + numbers)
    const validIds = suppliers
      .map(s => s.supplier_id)
      .filter(id => /^S\d+$/.test(id))
      .map(id => parseInt(id.substring(1)))
      .filter(num => !isNaN(num));

    // If no valid IDs found, start from 1
    if (validIds.length === 0) return 'S001';

    // Find the maximum ID and increment
    const maxId = Math.max(...validIds);
    const nextNum = maxId + 1;
    return 'S' + nextNum.toString().padStart(3, '0');
  };

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data || []);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Open form for new supplier
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
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
    }
  };

  // Add or update supplier
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier_id.trim() || !formData.name.trim()) {
      toast.error('كود المورد واسم الشركة مطلوبان');
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
        // Update existing supplier
        await supplierService.update(currentId, payload);
        toast.success('تم تحديث بيانات المورد بنجاح', { id: loadingToast });
      } else {
        // Insert new supplier
        try {
          await supplierService.create({
            supplier_id: formData.supplier_id.trim(),
            ...payload
          });
          toast.success('تم إضافة المورد بنجاح', { id: loadingToast });
        } catch (error: any) {
          if (error.message && error.message.includes('exists')) {
            toast.error(`كود المورد "${formData.supplier_id}" موجود بالفعل. جرب كوداً آخر.`, { id: loadingToast, duration: 4000 });
            return;
          }
          throw error;
        }
      }

      // Reset form and refresh data
      handleCancel();
      await fetchSuppliers();
    } catch (err: any) {
      toast.error('حدث خطأ: ' + (err.message || 'غير معروف'), { id: loadingToast });
      console.error(err);
    }
  };

  // Edit supplier
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
    setShowForm(true);
  };

  // Delete supplier
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;

    const loadingToast = toast.loading('جاري الحذف...');

    try {
      await supplierService.delete(id);

      toast.success('تم حذف المورد بنجاح', { id: loadingToast });
      await fetchSuppliers();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({
      supplier_id: '',
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      secondary_phone: '',
      address: '',
      speciality: ''
    });
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'اسم الشركة',
      header: 'اسم الشركة',
      render: (supplier: Supplier) => (
        <Link
          to={`/suppliers/${supplier.supplier_id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {supplier.name}
        </Link>
      )
    },
    { key: 'contact_person', label: 'المسئول', header: 'المسئول' },
    { key: 'phone', label: 'رقم الهاتف', header: 'رقم الهاتف' },
    { key: 'speciality', label: 'التخصص', header: 'التخصص' },
    {
      key: 'created_at',
      label: 'تاريخ التكويد',
      header: 'تاريخ التكويد',
      render: (supplier: Supplier) => supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('ar-EG') : '-'
    },
    {
      key: 'supplier_id',
      label: 'كود المورد',
      header: 'كود المورد',
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      header: 'الإجراءات',
      render: (supplier: Supplier) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(supplier)}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(supplier.id)}
          >
            حذف
          </Button>
        </div>
      ),
    },
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
          title="إدارة الموردين"
          headerAction={
            <Button onClick={() => {
              if (!showForm) handleOpenForm();
              else setShowForm(false);
            }}>
              {showForm ? 'إخفاء النموذج' : 'إضافة مورد جديد'}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? 'تعديل مورد' : 'إضافة مورد جديد'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="كود المورد *"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  disabled={isEditing}
                  placeholder="مثال: S001"
                  helperText={isEditing ? '' : 'تم توليد الكود تلقائياً - يمكنك تعديله'}
                  required
                />
                <Input
                  label="اسم الشركة *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم الشركة"
                  required
                />
                <Input
                  label="اسم المسئول / صاحب الشركة"
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
                  label="العنوان"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="العنوان الكامل"
                />
                <Input
                  label="التخصص"
                  value={formData.speciality}
                  onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                  placeholder="مثال: أدوات مكتبية، صيانة"
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
            <Table
              columns={columns}
              data={suppliers}
              emptyMessage="لا يوجد موردين"
            />
          )}
        </Card>
      </div>
    </>
  );
};
