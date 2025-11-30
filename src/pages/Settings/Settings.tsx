import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Select } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface ExpenseType {
    id: number;
    exptype_id: string;
    exptype_name: string;
    category: string;
}

interface RevenueType {
    id: number;
    revtype_id: string;
    revtype_name: string;
    paymethod: string;
}

type TabType = 'expense' | 'revenue';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('expense');

    // Expense Types State
    const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
    const [expenseLoading, setExpenseLoading] = useState(true);
    const [expenseEditing, setExpenseEditing] = useState(false);
    const [expenseCurrentId, setExpenseCurrentId] = useState<number | null>(null);
    const [expenseFormData, setExpenseFormData] = useState({
        exptype_id: '',
        exptype_name: '',
        category: ''
    });
    const [expenseShowForm, setExpenseShowForm] = useState(false);

    // Revenue Types State
    const [revenueTypes, setRevenueTypes] = useState<RevenueType[]>([]);
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [revenueEditing, setRevenueEditing] = useState(false);
    const [revenueCurrentId, setRevenueCurrentId] = useState<number | null>(null);
    const [revenueFormData, setRevenueFormData] = useState({
        revtype_id: '',
        revtype_name: '',
        paymethod: 'cash'
    });
    const [revenueShowForm, setRevenueShowForm] = useState(false);

    // Payment method options
    const paymentMethods = [
        { value: 'cash', label: 'نقدي' },
        { value: 'bank', label: 'تحويل بنكي' },
        { value: 'check', label: 'شيك' },
        { value: 'other', label: 'أخرى' },
    ];

    // ========== EXPENSE TYPES FUNCTIONS ==========

    const generateNextExpenseId = () => {
        if (expenseTypes.length === 0) return 'EXP001';
        const validIds = expenseTypes
            .map(e => e.exptype_id)
            .filter(id => /^EXP\d+$/.test(id))
            .map(id => parseInt(id.substring(3)))
            .filter(num => !isNaN(num));
        if (validIds.length === 0) return 'EXP001';
        const maxId = Math.max(...validIds);
        const nextNum = maxId + 1;
        return 'EXP' + nextNum.toString().padStart(3, '0');
    };

    const fetchExpenseTypes = async () => {
        try {
            setExpenseLoading(true);
            const { data, error } = await supabase
                .from('expense_types')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            setExpenseTypes(data || []);
        } catch (err: any) {
            toast.error('فشل في تحميل أنواع المصروفات: ' + err.message);
        } finally {
            setExpenseLoading(false);
        }
    };

    const handleExpenseOpenForm = () => {
        setExpenseShowForm(true);
        if (!expenseEditing) {
            setExpenseFormData({
                exptype_id: generateNextExpenseId(),
                exptype_name: '',
                category: ''
            });
        }
    };

    const handleExpenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseFormData.exptype_id.trim() || !expenseFormData.exptype_name.trim()) {
            toast.error('كود النوع والاسم مطلوبان');
            return;
        }

        const loadingToast = toast.loading(expenseEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

        try {
            if (expenseEditing && expenseCurrentId !== null) {
                const { error } = await supabase
                    .from('expense_types')
                    .update({
                        exptype_name: expenseFormData.exptype_name,
                        category: expenseFormData.category || null,
                    })
                    .eq('id', expenseCurrentId);
                if (error) throw error;
                toast.success('تم تحديث نوع المصروف بنجاح', { id: loadingToast });
            } else {
                const { error } = await supabase
                    .from('expense_types')
                    .insert([{
                        exptype_id: expenseFormData.exptype_id.trim(),
                        exptype_name: expenseFormData.exptype_name,
                        category: expenseFormData.category || null,
                    }]);
                if (error) {
                    if (error.code === '23505') {
                        toast.error(`كود النوع "${expenseFormData.exptype_id}" موجود بالفعل`, { id: loadingToast });
                        return;
                    }
                    throw error;
                }
                toast.success('تم إضافة نوع المصروف بنجاح', { id: loadingToast });
            }

            setExpenseFormData({ exptype_id: '', exptype_name: '', category: '' });
            setExpenseShowForm(false);
            setExpenseEditing(false);
            setExpenseCurrentId(null);
            await fetchExpenseTypes();
        } catch (err: any) {
            toast.error('حدث خطأ: ' + err.message, { id: loadingToast });
        }
    };

    const handleExpenseEdit = (expenseType: ExpenseType) => {
        setExpenseEditing(true);
        setExpenseCurrentId(expenseType.id);
        setExpenseFormData({
            exptype_id: expenseType.exptype_id,
            exptype_name: expenseType.exptype_name,
            category: expenseType.category || '',
        });
        setExpenseShowForm(true);
    };

    const handleExpenseDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;
        const loadingToast = toast.loading('جاري الحذف...');
        try {
            const { error } = await supabase.from('expense_types').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم حذف نوع المصروف بنجاح', { id: loadingToast });
            await fetchExpenseTypes();
        } catch (err: any) {
            toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
        }
    };

    const handleExpenseCancel = () => {
        setExpenseFormData({ exptype_id: '', exptype_name: '', category: '' });
        setExpenseShowForm(false);
        setExpenseEditing(false);
        setExpenseCurrentId(null);
    };

    // ========== REVENUE TYPES FUNCTIONS ==========

    const generateNextRevenueId = () => {
        if (revenueTypes.length === 0) return 'REV001';
        const validIds = revenueTypes
            .map(r => r.revtype_id)
            .filter(id => /^REV\d+$/.test(id))
            .map(id => parseInt(id.substring(3)))
            .filter(num => !isNaN(num));
        if (validIds.length === 0) return 'REV001';
        const maxId = Math.max(...validIds);
        const nextNum = maxId + 1;
        return 'REV' + nextNum.toString().padStart(3, '0');
    };

    const fetchRevenueTypes = async () => {
        try {
            setRevenueLoading(true);
            const { data, error } = await supabase
                .from('revenue_types')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            setRevenueTypes(data || []);
        } catch (err: any) {
            toast.error('فشل في تحميل أنواع الإيرادات: ' + err.message);
        } finally {
            setRevenueLoading(false);
        }
    };

    const handleRevenueOpenForm = () => {
        setRevenueShowForm(true);
        if (!revenueEditing) {
            setRevenueFormData({
                revtype_id: generateNextRevenueId(),
                revtype_name: '',
                paymethod: 'cash'
            });
        }
    };

    const handleRevenueSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!revenueFormData.revtype_id.trim() || !revenueFormData.revtype_name.trim()) {
            toast.error('كود النوع والاسم مطلوبان');
            return;
        }

        const loadingToast = toast.loading(revenueEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

        try {
            if (revenueEditing && revenueCurrentId !== null) {
                const { error } = await supabase
                    .from('revenue_types')
                    .update({
                        revtype_name: revenueFormData.revtype_name,
                        paymethod: revenueFormData.paymethod,
                    })
                    .eq('id', revenueCurrentId);
                if (error) throw error;
                toast.success('تم تحديث نوع الإيراد بنجاح', { id: loadingToast });
            } else {
                const { error } = await supabase
                    .from('revenue_types')
                    .insert([{
                        revtype_id: revenueFormData.revtype_id.trim(),
                        revtype_name: revenueFormData.revtype_name,
                        paymethod: revenueFormData.paymethod,
                    }]);
                if (error) {
                    if (error.code === '23505') {
                        toast.error(`كود النوع "${revenueFormData.revtype_id}" موجود بالفعل`, { id: loadingToast });
                        return;
                    }
                    throw error;
                }
                toast.success('تم إضافة نوع الإيراد بنجاح', { id: loadingToast });
            }

            setRevenueFormData({ revtype_id: '', revtype_name: '', paymethod: 'cash' });
            setRevenueShowForm(false);
            setRevenueEditing(false);
            setRevenueCurrentId(null);
            await fetchRevenueTypes();
        } catch (err: any) {
            toast.error('حدث خطأ: ' + err.message, { id: loadingToast });
        }
    };

    const handleRevenueEdit = (revenueType: RevenueType) => {
        setRevenueEditing(true);
        setRevenueCurrentId(revenueType.id);
        setRevenueFormData({
            revtype_id: revenueType.revtype_id,
            revtype_name: revenueType.revtype_name,
            paymethod: revenueType.paymethod || 'cash',
        });
        setRevenueShowForm(true);
    };

    const handleRevenueDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;
        const loadingToast = toast.loading('جاري الحذف...');
        try {
            const { error } = await supabase.from('revenue_types').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم حذف نوع الإيراد بنجاح', { id: loadingToast });
            await fetchRevenueTypes();
        } catch (err: any) {
            toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
        }
    };

    const handleRevenueCancel = () => {
        setRevenueFormData({ revtype_id: '', revtype_name: '', paymethod: 'cash' });
        setRevenueShowForm(false);
        setRevenueEditing(false);
        setRevenueCurrentId(null);
    };

    // ========== TABLE COLUMNS ==========

    const expenseColumns = [
        { key: 'exptype_id', label: 'كود النوع', header: 'كود النوع' },
        { key: 'exptype_name', label: 'اسم النوع', header: 'اسم النوع' },
        { key: 'category', label: 'التصنيف', header: 'التصنيف' },
        {
            key: 'actions',
            label: 'الإجراءات',
            header: 'الإجراءات',
            render: (expenseType: ExpenseType) => (
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleExpenseEdit(expenseType)}>
                        تعديل
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleExpenseDelete(expenseType.id)}>
                        حذف
                    </Button>
                </div>
            ),
        },
    ];

    const revenueColumns = [
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
                    <Button variant="secondary" size="sm" onClick={() => handleRevenueEdit(revenueType)}>
                        تعديل
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleRevenueDelete(revenueType.id)}>
                        حذف
                    </Button>
                </div>
            ),
        },
    ];

    // ========== EFFECTS ==========

    useEffect(() => {
        fetchExpenseTypes();
        fetchRevenueTypes();
    }, []);

    // ========== RENDER ==========

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
                {/* Tabs */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setActiveTab('expense')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'expense'
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                أنواع المصروفات
                            </button>
                            <button
                                onClick={() => setActiveTab('revenue')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'revenue'
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                أنواع الإيرادات
                            </button>
                        </div>

                        <Button
                            onClick={() => {
                                if (activeTab === 'expense') {
                                    if (!expenseShowForm) handleExpenseOpenForm();
                                    else setExpenseShowForm(false);
                                } else {
                                    if (!revenueShowForm) handleRevenueOpenForm();
                                    else setRevenueShowForm(false);
                                }
                            }}
                        >
                            {activeTab === 'expense'
                                ? (expenseShowForm ? 'إخفاء النموذج' : 'إضافة نوع مصروف')
                                : (revenueShowForm ? 'إخفاء النموذج' : 'إضافة نوع إيراد')
                            }
                        </Button>
                    </div>

                    {/* Expense Types Tab */}
                    {activeTab === 'expense' && (
                        <>
                            {expenseShowForm && (
                                <form onSubmit={handleExpenseSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">
                                        {expenseEditing ? 'تعديل نوع مصروف' : 'إضافة نوع مصروف جديد'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            label="كود النوع *"
                                            value={expenseFormData.exptype_id}
                                            onChange={(e) => setExpenseFormData({ ...expenseFormData, exptype_id: e.target.value })}
                                            disabled={expenseEditing}
                                            placeholder="مثال: EXP001"
                                            helperText={expenseEditing ? '' : 'تم توليد الكود تلقائياً - يمكنك تعديله'}
                                            required
                                        />
                                        <Input
                                            label="اسم النوع *"
                                            value={expenseFormData.exptype_name}
                                            onChange={(e) => setExpenseFormData({ ...expenseFormData, exptype_name: e.target.value })}
                                            placeholder="مثال: وقود"
                                            required
                                        />
                                        <Input
                                            label="التصنيف"
                                            value={expenseFormData.category}
                                            onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                                            placeholder="مثال: تشغيلي، إداري"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button type="submit">
                                            {expenseEditing ? 'تحديث' : 'إضافة'}
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={handleExpenseCancel}>
                                            إلغاء
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {expenseLoading ? (
                                <div className="text-center py-8">جاري التحميل...</div>
                            ) : (
                                <Table
                                    columns={expenseColumns}
                                    data={expenseTypes}
                                    emptyMessage="لا يوجد أنواع مصروفات"
                                />
                            )}
                        </>
                    )}

                    {/* Revenue Types Tab */}
                    {activeTab === 'revenue' && (
                        <>
                            {revenueShowForm && (
                                <form onSubmit={handleRevenueSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">
                                        {revenueEditing ? 'تعديل نوع إيراد' : 'إضافة نوع إيراد جديد'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            label="كود النوع *"
                                            value={revenueFormData.revtype_id}
                                            onChange={(e) => setRevenueFormData({ ...revenueFormData, revtype_id: e.target.value })}
                                            disabled={revenueEditing}
                                            placeholder="مثال: REV001"
                                            helperText={revenueEditing ? '' : 'تم توليد الكود تلقائياً - يمكنك تعديله'}
                                            required
                                        />
                                        <Input
                                            label="اسم النوع *"
                                            value={revenueFormData.revtype_name}
                                            onChange={(e) => setRevenueFormData({ ...revenueFormData, revtype_name: e.target.value })}
                                            placeholder="مثال: مبيعات، خدمات"
                                            required
                                        />
                                        <Select
                                            label="طريقة الدفع الافتراضية"
                                            value={revenueFormData.paymethod}
                                            onChange={(e) => setRevenueFormData({ ...revenueFormData, paymethod: e.target.value })}
                                            options={paymentMethods}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button type="submit">
                                            {revenueEditing ? 'تحديث' : 'إضافة'}
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={handleRevenueCancel}>
                                            إلغاء
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {revenueLoading ? (
                                <div className="text-center py-8">جاري التحميل...</div>
                            ) : (
                                <Table
                                    columns={revenueColumns}
                                    data={revenueTypes}
                                    emptyMessage="لا يوجد أنواع إيرادات"
                                />
                            )}
                        </>
                    )}
                </Card>
            </div>
        </>
    );
};
