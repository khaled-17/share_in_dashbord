import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { employeeService } from '../../services/employees';
import type { Employee } from '../../services/employees';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    emp_code: '',
    name: '',
    phone: '',
    salary: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Generate next employee code
  const generateNextCode = () => {
    if (!Array.isArray(employees) || employees.length === 0) return 'E001';

    // Filter employees with valid format (E + numbers)
    const validCodes = employees
      .map(e => e.emp_code)
      .filter(code => typeof code === 'string' && /^E\d+$/.test(code))
      .map(code => parseInt(code.substring(1)))
      .filter(num => !isNaN(num));

    // If no valid codes found, start from 1
    if (validCodes.length === 0) return 'E001';

    // Find the maximum code and increment
    const maxCode = Math.max(...validCodes);
    const nextNum = maxCode + 1;
    return 'E' + nextNum.toString().padStart(3, '0');
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      setEmployees([]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Open form for new employee
  const handleOpenForm = () => {
    setShowForm(true);
    if (!isEditing) {
      setFormData({
        emp_code: generateNextCode(),
        name: '',
        phone: '',
        salary: ''
      });
    }
  };

  // Add or update employee
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.emp_code.trim() || !formData.name.trim()) {
      toast.error('كود الموظف والاسم مطلوبان');
      return;
    }

    const salary = formData.salary ? parseFloat(formData.salary) : null;
    if (formData.salary && (isNaN(salary!) || salary! < 0)) {
      toast.error('الراتب يجب أن يكون رقماً موجباً');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

    try {
      if (isEditing && currentId !== null) {
        // Update existing employee
        await employeeService.update(currentId, {
          emp_code: formData.emp_code.trim(),
          name: formData.name,
          phone: formData.phone || null,
          salary: salary,
        });

        toast.success('تم تحديث بيانات الموظف بنجاح', { id: loadingToast });
      } else {
        // Insert new employee
        await employeeService.create({
          emp_code: formData.emp_code.trim(),
          name: formData.name,
          phone: formData.phone || null,
          salary: salary,
        });

        toast.success('تم إضافة الموظف بنجاح', { id: loadingToast });
      }

      // Reset form and refresh data
      setFormData({ emp_code: '', name: '', phone: '', salary: '' });
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      await fetchEmployees();
    } catch (err: any) {
      toast.error('حدث خطأ: ' + (err.message || 'غير معروف'), { id: loadingToast });
      console.error(err);
    }
  };

  // Edit employee
  const handleEdit = (employee: Employee) => {
    setIsEditing(true);
    setCurrentId(employee.id);
    setFormData({
      emp_code: employee.emp_code,
      name: employee.name,
      phone: employee.phone || '',
      salary: employee.salary ? employee.salary.toString() : '',
    });
    setShowForm(true);
  };

  // Delete employee
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    const loadingToast = toast.loading('جاري الحذف...');

    try {
      await employeeService.delete(id);

      toast.success('تم حذف الموظف بنجاح', { id: loadingToast });
      await fetchEmployees();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
      console.error(err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ emp_code: '', name: '', phone: '', salary: '' });
    setShowForm(false);
    setIsEditing(false);
    setCurrentId(null);
  };

  // Format salary
  const formatSalary = (salary: number | null | undefined) => {
    if (!salary) return '-';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(salary);
  };

  // Table columns
  const columns = [
    { key: 'emp_code', label: 'كود الموظف', header: 'كود الموظف' },
    { key: 'name', label: 'الاسم الكامل', header: 'الاسم الكامل' },
    { key: 'phone', label: 'رقم الهاتف', header: 'رقم الهاتف' },
    {
      key: 'salary',
      label: 'الراتب',
      header: 'الراتب',
      render: (employee: Employee) => formatSalary(employee.salary)
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      header: 'الإجراءات',
      render: (employee: Employee) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(employee)}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(employee.id)}
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
          title="إدارة الموظفين"
          headerAction={
            <Button onClick={() => {
              if (!showForm) handleOpenForm();
              else setShowForm(false);
            }}>
              {showForm ? 'إخفاء النموذج' : 'إضافة موظف جديد'}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? 'تعديل موظف' : 'إضافة موظف جديد'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="كود الموظف *"
                  value={formData.emp_code}
                  onChange={(e) => setFormData({ ...formData, emp_code: e.target.value })}
                  disabled={isEditing}
                  placeholder="مثال: E001"
                  helperText={isEditing ? '' : 'تم توليد الكود تلقائياً - يمكنك تعديله'}
                  required
                />
                <Input
                  label="الاسم الكامل *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم الموظف الكامل"
                  required
                />
                <Input
                  label="رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
                <Input
                  label="الراتب"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="0.00"
                  helperText="اترك فارغاً إذا لم يتم تحديده بعد"
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
              data={employees}
              emptyMessage="لا يوجد موظفين"
            />
          )}
        </Card>
      </div>
    </>
  );
};
