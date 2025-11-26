import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface ExpenseType {
  id: number;
  exptype_id: string;
  exptype_name: string;
  category: string;
}

export const ExpenseTypes: React.FC = () => {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    exptype_id: '', 
    exptype_name: '', 
    category: '' 
  });
  const [showForm, setShowForm] = useState(false);

  // Generate next expense type ID
  const generateNextId = () => {
    if (expenseTypes.length === 0) return 'EXP001';
    
    // Filter expense types with valid format (EXP + numbers)
    const validIds = expenseTypes
      .map(e => e.exptype_id)
      .filter(id => /^EXP\d+$/.test(id))
      .map(id => parseInt(id.substring(3)))
      .filter(num => !isNaN(num));
    
    // If no valid IDs found, start from 1
    if (validIds.length === 0) return 'EXP001';
    
    // Find the maximum ID and increment
    const maxId = Math.max(...validIds);
    const nextNum = maxId + 1;
    return 'EXP' + nextNum.toString().padStart(3, '0');
  };

  // Fetch expense types from Supabase
  const fetchExpenseTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('expense_types')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      
      setExpenseTypes(data || []);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  // Open form for new expense type
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
      setFormData({
        exptype_id: generateNextId(),
        exptype_name: '',
        category: ''
      });
    }
  };

  // Add or update expense type
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.exptype_id.trim() || !formData.exptype_name.trim()) {
      toast.error('كود النوع والاسم مطلوبان');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

    try {
      if (isEditing && currentId !== null) {
        // Update existing expense type
        const { error: updateError } = await supabase
          .from('expense_types')
          .update({
            exptype_name: formData.exptype_name,
            category: formData.category || null,
          })
          .eq('id', currentId);

        if (updateError) throw updateError;
        
        toast.success('تم تحديث نوع المصروف بنجاح', { id: loadingToast });
      } else {
        // Insert new expense type
        const { error: insertError } = await supabase
          .from('expense_types')
          .insert([{
            exptype_id: formData.exptype_id.trim(),
            exptype_name: formData.exptype_name,
            category: formData.category || null,
          }]);

        if (insertError) {
          if (insertError.code === '23505') {
            toast.error(`كود النوع "${formData.exptype_id}" موجود بالفعل. جرب كوداً آخر.`, { id: loadingToast, duration: 4000 });
          } else {
            throw insertError;
          }
          return;
        }
        
        toast.success('تم إضافة نوع المصروف بنجاح', { id: loadingToast });
      }

      // Reset form and refresh data
      setFormData({ exptype_id: '', exptype_name: '', category: '' });
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      await fetchExpenseTypes();
    } catch (err: any) {
      toast.error('حدث خطأ: ' + (err.message || 'غير معروف'), { id: loadingToast });
      console.error(err);
    }
  };

  // Edit expense type
  const handleEdit = (expenseType: ExpenseType) => {
    setIsEditing(true);
    setCurrentId(expenseType.id);
    setFormData({
      exptype_id: expenseType.exptype_id,
      exptype_name: expenseType.exptype_name,
      category: expenseType.category || '',
    });
    setShowForm(true);
  };

  // Delete expense type
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;

    const loadingToast = toast.loading('جاري الحذف...');

    try {
      const { error: deleteError } = await supabase
        .from('expense_types')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('تم حذف نوع المصروف بنجاح', { id: loadingToast });
      await fetchExpenseTypes();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ exptype_id: '', exptype_name: '', category: '' });
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
  };

  // Table columns
  const columns = [
    { key: 'exptype_id', label: 'كود النوع', header: 'كود النوع' },
    { key: 'exptype_name', label: 'اسم النوع', header: 'اسم النوع' },
    { key: 'category', label: 'التصنيف', header: 'التصنيف' },
    {
      key: 'actions',
      label: 'الإجراءات',
      header: 'الإجراءات',
      render: (expenseType: ExpenseType) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(expenseType)}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(expenseType.id)}
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
          title="إدارة أنواع المصروفات"
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
                {isEditing ? 'تعديل نوع مصروف' : 'إضافة نوع مصروف جديد'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="كود النوع *"
                  value={formData.exptype_id}
                  onChange={(e) => setFormData({ ...formData, exptype_id: e.target.value })}
                  disabled={isEditing}
                  placeholder="مثال: EXP001"
                  helperText={isEditing ? '' : 'تم توليد الكود تلقائياً - يمكنك تعديله'}
                  required
                />
                <Input
                  label="اسم النوع *"
                  value={formData.exptype_name}
                  onChange={(e) => setFormData({ ...formData, exptype_name: e.target.value })}
                  placeholder="مثال: وقود"
                  required
                />
                <Input
                  label="التصنيف"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="مثال: تشغيلي، إداري"
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
              data={expenseTypes}
              emptyMessage="لا يوجد أنواع مصروفات"
            />
          )}
        </Card>
      </div>
    </>
  );
};
