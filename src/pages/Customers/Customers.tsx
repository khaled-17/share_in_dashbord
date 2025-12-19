import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { customerService } from '../../services/customers';
import type { Customer } from '../../services/customers';
import { Link } from 'react-router-dom';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    phone: '',
    address: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Generate next customer ID
  const generateNextId = () => {
    if (customers.length === 0) return 'C00001';

    // Filter customers with valid format (C + numbers)
    const validIds = customers
      .map(c => c.customer_id)
      .filter(id => /^C\d+$/.test(id))
      .map(id => parseInt(id.substring(1)))
      .filter(num => !isNaN(num));

    // If no valid IDs found, start from 1
    if (validIds.length === 0) return 'C00001';

    // Find the maximum ID and increment
    const maxId = Math.max(...validIds);
    const nextNum = maxId + 1;
    return 'C' + nextNum.toString().padStart(5, '0');
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getAll();
      setCustomers(data || []);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Open form for new customer
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
      setFormData({
        customer_id: generateNextId(),
        name: '',
        phone: '',
        address: ''
      });
    }
  };

  // Add or update customer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id.trim() || !formData.name.trim()) {
      toast.error('رقم العميل والاسم مطلوبان');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

    try {
      if (isEditing && currentId) {
        // Update existing customer
        await customerService.update(currentId, {
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
        });

        toast.success('تم تحديث العميل بنجاح', { id: loadingToast });
      } else {
        // Insert new customer
        try {
          await customerService.create({
            customer_id: formData.customer_id.trim(),
            name: formData.name,
            phone: formData.phone || null,
            address: formData.address || null,
          });
          toast.success('تم إضافة العميل بنجاح', { id: loadingToast });
        } catch (error: any) {
          // Check for duplicate ID error from backend
          if (error.message && error.message.includes('exists')) { // Simplified check, refine based on backend error format
            toast.error(`رقم العميل "${formData.customer_id}" موجود بالفعل. جرب رقماً آخر.`, { id: loadingToast, duration: 4000 });
            return;
          }
          throw error;
        }
      }

      // Reset form and refresh data
      setFormData({ customer_id: '', name: '', phone: '', address: '' });
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      await fetchCustomers();
    } catch (err: any) {
      toast.error('حدث خطأ: ' + (err.message || 'غير معروف'), { id: loadingToast });
      console.error(err);
    }
  };

  // Edit customer
  const handleEdit = (customer: Customer) => {
    setIsEditing(true);
    setCurrentId(customer.customer_id);
    setFormData({
      customer_id: customer.customer_id,
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowForm(true);
  };

  // Delete customer
  const handleDelete = async (customerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;

    const loadingToast = toast.loading('جاري الحذف...');

    try {
      await customerService.delete(customerId);

      toast.success('تم حذف العميل بنجاح', { id: loadingToast });
      await fetchCustomers();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ customer_id: '', name: '', phone: '', address: '' });
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
  };

  // Table columns
  const columns = [
    { key: 'customer_id', label: 'رقم العميل', header: 'رقم العميل' },
    {
      key: 'name',
      label: 'الاسم',
      header: 'الاسم',
      render: (customer: Customer) => (
        <Link
          to={`/customers/${customer.customer_id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {customer.name}
        </Link>
      )
    },
    { key: 'phone', label: 'رقم الهاتف', header: 'رقم الهاتف' },
    { key: 'address', label: 'العنوان', header: 'العنوان' },
    {
      key: 'actions',
      label: 'الإجراءات',
      header: 'الإجراءات',
      render: (customer: Customer) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(customer)}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(customer.customer_id)}
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
          title="إدارة العملاء"
          headerAction={
            <Button onClick={() => {
              if (!showForm) handleOpenForm();
              else setShowForm(false);
            }}>
              {showForm ? 'إخفاء النموذج' : 'إضافة عميل جديد'}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? 'تعديل عميل' : 'إضافة عميل جديد'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="رقم العميل *"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  disabled={isEditing}
                  placeholder="مثال: C00001"
                  helperText={isEditing ? '' : 'تم توليد الرقم تلقائياً - يمكنك تعديله'}
                  required
                />
                <Input
                  label="الاسم *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم العميل"
                  required
                />
                <Input
                  label="رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
                <Input
                  label="العنوان"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="العنوان الكامل"
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
              data={customers}
              emptyMessage="لا يوجد عملاء"
            />
          )}
        </Card>
      </div>
    </>
  );
};
