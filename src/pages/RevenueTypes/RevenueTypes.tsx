import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Select } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface RevenueType {
  id: number;
  revtype_id: string;
  revtype_name: string;
  paymethod: string;
}

export const RevenueTypes: React.FC = () => {
  const [revenueTypes, setRevenueTypes] = useState<RevenueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    revtype_id: '', 
    revtype_name: '', 
    paymethod: 'cash' 
  });
  const [showForm, setShowForm] = useState(false);

  // Generate next revenue type ID
  const generateNextId = () => {
    if (revenueTypes.length === 0) return 'REV001';
    
    // Filter revenue types with valid format (REV + numbers)
    const validIds = revenueTypes
      .map(r => r.revtype_id)
      .filter(id => /^REV\d+$/.test(id))
      .map(id => parseInt(id.substring(3)))
      .filter(num => !isNaN(num));
    
    // If no valid IDs found, start from 1
    if (validIds.length === 0) return 'REV001';
    
    // Find the maximum ID and increment
    const maxId = Math.max(...validIds);
    const nextNum = maxId + 1;
    return 'REV' + nextNum.toString().padStart(3, '0');
  };

  // Fetch revenue types from Supabase
  const fetchRevenueTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('revenue_types')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      
      setRevenueTypes(data || []);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueTypes();
  }, []);

  // Open form for new revenue type
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
      setFormData({
        revtype_id: generateNextId(),
        revtype_name: '',
        paymethod: 'cash'
      });
    }
  };

  // Add or update revenue type
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.revtype_id.trim() || !formData.revtype_name.trim()) {
      toast.error('كود النوع والاسم مطلوبان');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

    try {
      if (isEditing && currentId !== null) {
        // Update existing revenue type
        const { error: updateError } = await supabase
          .from('revenue_types')
          .update({
            revtype_name: formData.revtype_name,
            paymethod: formData.paymethod,
          })
          .eq('id', currentId);

        if (updateError) throw updateError;
        
        toast.success('تم تحديث نوع الإيراد بنجاح', { id: loadingToast });
      } else {
        // Insert new revenue type
        const { error: insertError } = await supabase
          .from('revenue_types')
          .insert([{
            revtype_id: formData.revtype_id.trim(),
            revtype_name: formData.revtype_name,
            paymethod: formData.paymethod,
          }]);

        if (insertError) {
          if (insertError.code === '23505') {
            toast.error(`كود النوع "${formData.revtype_id}" موجود بالفعل. جرب كوداً آخر.`, { id: loadingToast, duration: 4000 });
          } else {
            throw insertError;
          }
          return;
        }
        
        toast.success('تم إضافة نوع الإيراد بنجاح', { id: loadingToast });
      }

      // Reset form and refresh data
      setFormData({ revtype_id: '', revtype_name: '', paymethod: 'cash' });
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      await fetchRevenueTypes();
    } catch (err: any) {
      toast.error('حدث خطأ: ' + (err.message || 'غير معروف'), { id: loadingToast });
      console.error(err);
    }
  };

  // Edit revenue type
  const handleEdit = (revenueType: RevenueType) => {
    setIsEditing(true);
    setCurrentId(revenueType.id);
    setFormData({
      revtype_id: revenueType.revtype_id,
      revtype_name: revenueType.revtype_name,
      paymethod: revenueType.paymethod || 'cash',
    });
    setShowForm(true);
  };

  // Delete revenue type
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;

    const loadingToast = toast.loading('جاري الحذف...');

    try {
      const { error: deleteError } = await supabase
        .from('revenue_types')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('تم حذف نوع الإيراد بنجاح', { id: loadingToast });
      await fetchRevenueTypes();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ revtype_id: '', revtype_name: '', paymethod: 'cash' });
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
  };

  // Payment method options
  const paymentMethods = [
    { value: 'cash', label: 'نقدي' },
    { value: 'bank', label: 'تحويل بنكي' },
    { value: 'check', label: 'شيك' },
    { value: 'other', label: 'أخرى' },
  ];

  // Table columns
  const columns = [
    { key: 'revtype_id', label: 'كود النوع', header: 'كود النوع' },
    { key: 'revtype_name', label: 'اسم النوع', header: 'اسم النوع' },
    { 
      key: 'paymethod', 
      label: 'طريقة الدفع', 
      header: 'طريقة الدفع',
      render: (row: RevenueType) => {
        const method = paymentMethods.find(m => m.value === row.paymethod);
        return method ? method.label : row.paymethod;
      }
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      header: 'الإجراءات',
      render: (revenueType: RevenueType) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(revenueType)}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(revenueType.id)}
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
          title="إدارة أنواع الإيرادات"
          headerAction={
            <Button onClick={() => {
              if (!showForm) handleOpenForm();
              else setShowForm(false);
            }}>
              {showForm ? 'إخفاء النموذج' : 'إضافة نوع جديد'}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? 'تعديل نوع إيراد' : 'إضافة نوع إيراد جديد'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="كود النوع *"
                  value={formData.revtype_id}
                  onChange={(e) => setFormData({ ...formData, revtype_id: e.target.value })}
                  disabled={isEditing}
                  placeholder="مثال: REV001"
                  helperText={isEditing ? '' : 'تم توليد الكود تلقائياً - يمكنك تعديله'}
                  required
                />
                <Input
                  label="اسم النوع *"
                  value={formData.revtype_name}
                  onChange={(e) => setFormData({ ...formData, revtype_name: e.target.value })}
                  placeholder="مثال: مبيعات، خدمات"
                  required
                />
                <Select
                  label="طريقة الدفع الافتراضية"
                  value={formData.paymethod}
                  onChange={(e) => setFormData({ ...formData, paymethod: e.target.value })}
                  options={paymentMethods}
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
              data={revenueTypes}
              emptyMessage="لا يوجد أنواع إيرادات"
            />
          )}
        </Card>
      </div>
    </>
  );
};
