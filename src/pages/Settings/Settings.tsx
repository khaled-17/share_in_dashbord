import { useState, useEffect } from 'react';
import { Card, Button, Table, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { settingsService, type ExpenseType, type RevenueType, type ProjectType } from '../../services/settings';
import { companyService, type CompanySettings } from '../../services/company';

type TabType = 'expense' | 'revenue' | 'project' | 'company';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('expense');

    // Company Settings State
    const [companyInfo, setCompanyInfo] = useState<CompanySettings | null>(null);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companyFormData, setCompanyFormData] = useState({
        name: '',
        description: '',
        about: '',
        address: '',
        phone: '',
        email: '',
        website: ''
    });

    // Expense Types State
    const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
    const [expenseLoading, setExpenseLoading] = useState(true);
    // ... rest of state
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

    // Project Types State
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [projectLoading, setProjectLoading] = useState(true);
    const [projectEditing, setProjectEditing] = useState(false);
    const [projectCurrentId, setProjectCurrentId] = useState<number | null>(null);
    const [projectFormData, setProjectFormData] = useState({
        type_id: '',
        type_name: ''
    });
    const [projectShowForm, setProjectShowForm] = useState(false);

    // ========== GENERAL FUNCTIONS ==========
    const fetchData = async () => {
        await Promise.all([
            fetchExpenseTypes(),
            fetchRevenueTypes(),
            fetchProjectTypes(),
            fetchCompanyInfo()
        ]);
    };

console.log(companyInfo,companyLoading);

    
    const fetchCompanyInfo = async () => {
        try {
            setCompanyLoading(true);
            const data = await companyService.getSettings();
            if (data) {
                setCompanyInfo(data);
                setCompanyFormData({
                    name: data.name || '',
                    description: data.description || '',
                    about: data.about || '',
                    address: data.address || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    website: data.website || ''
                });
            }
        } catch (err: any) {
            console.error('Failed to fetch company info:', err);
        } finally {
            setCompanyLoading(false);
        }
    };

    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadingToast = toast.loading('جاري تحديث بيانات الشركة...');
        try {
            await companyService.updateSettings(companyFormData);
            toast.success('تم تحديث بيانات الشركة بنجاح', { id: loadingToast });
            fetchCompanyInfo();
        } catch (err: any) {
            toast.error('فشل التحديث: ' + err.message, { id: loadingToast });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ========== PROJECT TYPES FUNCTIONS ==========
    const generateNextProjectId = () => {
        if (projectTypes.length === 0) return 'PRJ001';
        const validIds = projectTypes
            .map(p => p.type_id)
            .filter(id => /^PRJ\d+$/.test(id))
            .map(id => parseInt(id.substring(3)))
            .filter(num => !isNaN(num));
        if (validIds.length === 0) return 'PRJ001';
        const maxId = Math.max(...validIds);
        const nextNum = maxId + 1;
        return 'PRJ' + nextNum.toString().padStart(3, '0');
    };

    const fetchProjectTypes = async () => {
        try {
            setProjectLoading(true);
            const data = await settingsService.getProjectTypes();
            setProjectTypes(data || []);
        } catch (err: any) {
            toast.error('فشل في تحميل أنواع المشاريع: ' + err.message);
        } finally {
            setProjectLoading(false);
        }
    };

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectFormData.type_id.trim() || !projectFormData.type_name.trim()) {
            toast.error('كود النوع والاسم مطلوبان');
            return;
        }

        const loadingToast = toast.loading(projectEditing ? 'جاري التحديث...' : 'جاري الإضافة...');

        try {
            if (projectEditing && projectCurrentId !== null) {
                await settingsService.updateProjectType(projectCurrentId, {
                    type_name: projectFormData.type_name,
                });
                toast.success('تم تحديث نوع المشروع بنجاح', { id: loadingToast });
            } else {
                await settingsService.createProjectType({
                    type_id: projectFormData.type_id.trim(),
                    type_name: projectFormData.type_name,
                });
                toast.success('تم إضافة نوع المشروع بنجاح', { id: loadingToast });
            }

            handleProjectCancel();
            await fetchProjectTypes();
        } catch (err: any) {
            toast.error('حدث خطأ: ' + err.message, { id: loadingToast });
        }
    };

    const handleProjectEdit = (type: ProjectType) => {
        setProjectEditing(true);
        setProjectCurrentId(type.id);
        setProjectFormData({
            type_id: type.type_id,
            type_name: type.type_name,
        });
        setProjectShowForm(true);
    };

    const handleProjectDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;
        const loadingToast = toast.loading('جاري الحذف...');
        try {
            await settingsService.deleteProjectType(id);
            toast.success('تم حذف نوع المشروع بنجاح', { id: loadingToast });
            await fetchProjectTypes();
        } catch (err: any) {
            toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
        }
    };

    const handleProjectCancel = () => {
        setProjectFormData({ type_id: '', type_name: '' });
        setProjectShowForm(false);
        setProjectEditing(false);
        setProjectCurrentId(null);
    };

    // ========== EXPENSE TYPES FUNCTIONS ==========
    const fetchExpenseTypes = async () => {
        try {
            setExpenseLoading(true);
            const data = await settingsService.getExpenseTypes();
            setExpenseTypes(data || []);
        } catch (err: any) {
            toast.error('فشل في تحميل أنواع المصروفات: ' + err.message);
        } finally {
            setExpenseLoading(false);
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
                await settingsService.updateExpenseType(expenseCurrentId, {
                    exptype_name: expenseFormData.exptype_name,
                    category: expenseFormData.category || null,
                });
                toast.success('تم تحديث نوع المصروف بنجاح', { id: loadingToast });
            } else {
                await settingsService.createExpenseType({
                    exptype_id: expenseFormData.exptype_id.trim(),
                    exptype_name: expenseFormData.exptype_name,
                    category: expenseFormData.category || null,
                });
                toast.success('تم إضافة نوع المصروف بنجاح', { id: loadingToast });
            }
            handleExpenseCancel();
            await fetchExpenseTypes();
        } catch (err: any) {
            toast.error('حدث خطأ: ' + err.message, { id: loadingToast });
        }
    };

    const handleExpenseCancel = () => {
        setExpenseFormData({ exptype_id: '', exptype_name: '', category: '' });
        setExpenseShowForm(false);
        setExpenseEditing(false);
        setExpenseCurrentId(null);
    };

    const handleExpenseEdit = (t: ExpenseType) => {
        setExpenseEditing(true);
        setExpenseCurrentId(t.id);
        setExpenseFormData({ exptype_id: t.exptype_id, exptype_name: t.exptype_name, category: t.category || '' });
        setExpenseShowForm(true);
    };

    const handleExpenseDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try { await settingsService.deleteExpenseType(id); fetchExpenseTypes(); } catch (e) { }
    };

    // ========== REVENUE TYPES FUNCTIONS ==========
    const fetchRevenueTypes = async () => {
        try {
            setRevenueLoading(true);
            const data = await settingsService.getRevenueTypes();
            setRevenueTypes(data || []);
        } catch (err: any) {
            toast.error('فشل في تحميل أنواع الإيرادات: ' + err.message);
        } finally {
            setRevenueLoading(false);
        }
    };

    const handleRevenueSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadingToast = toast.loading('جاري الحفظ...');
        try {
            if (revenueEditing && revenueCurrentId) {
                await settingsService.updateRevenueType(revenueCurrentId, revenueFormData);
            } else {
                await settingsService.createRevenueType(revenueFormData);
            }
            handleRevenueCancel();
            fetchRevenueTypes();
            toast.success('تم الحفظ', { id: loadingToast });
        } catch (e: any) { toast.error(e.message, { id: loadingToast }); }
    };

    const handleRevenueCancel = () => {
        setRevenueFormData({ revtype_id: '', revtype_name: '', paymethod: 'cash' });
        setRevenueShowForm(false);
        setRevenueEditing(false);
        setRevenueCurrentId(null);
    };

    const handleRevenueEdit = (t: RevenueType) => {
        setRevenueEditing(true);
        setRevenueCurrentId(t.id);
        setRevenueFormData({ revtype_id: t.revtype_id, revtype_name: t.revtype_name, paymethod: t.paymethod });
        setRevenueShowForm(true);
    };

    // ========== COLUMNS ==========
    const projectColumns = [
        { key: 'type_id', header: 'كود النوع' },
        { key: 'type_name', header: 'اسم النوع' },
        {
            key: 'actions',
            header: 'الإجراءات',
            render: (type: ProjectType) => (
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleProjectEdit(type)}>تعديل</Button>
                    <Button variant="danger" size="sm" onClick={() => handleProjectDelete(type.id)}>حذف</Button>
                </div>
            )
        }
    ];

    const expenseColumns = [
        { key: 'exptype_id', header: 'كود النوع' },
        { key: 'exptype_name', header: 'اسم النوع' },
        {
            key: 'actions',
            header: 'الإجراءات',
            render: (t: ExpenseType) => (
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleExpenseEdit(t)}>تعديل</Button>
                    <Button variant="danger" size="sm" onClick={() => handleExpenseDelete(t.id)}>حذف</Button>
                </div>
            )
        }
    ];

    const revenueColumns = [
        { key: 'revtype_id', header: 'كود النوع' },
        { key: 'revtype_name', header: 'اسم النوع' },
        {
            key: 'actions',
            header: 'الإجراءات',
            render: (t: RevenueType) => (
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleRevenueEdit(t)}>تعديل</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 text-right" dir="rtl">
            <Toaster position="top-center" />
            <Card title="الإعدادات">
                <div className="flex gap-4 mb-6 border-b pb-4">
                    <button onClick={() => setActiveTab('expense')} className={`pb-2 px-4 ${activeTab === 'expense' ? 'border-b-2 border-primary-600 text-primary-600 font-bold' : ''}`}>أنواع المصروفات</button>
                    <button onClick={() => setActiveTab('revenue')} className={`pb-2 px-4 ${activeTab === 'revenue' ? 'border-b-2 border-primary-600 text-primary-600 font-bold' : ''}`}>أنواع الإيرادات</button>
                    <button onClick={() => setActiveTab('project')} className={`pb-2 px-4 ${activeTab === 'project' ? 'border-b-2 border-primary-600 text-primary-600 font-bold' : ''}`}>أنواع المشاريع</button>
                    <button onClick={() => setActiveTab('company')} className={`pb-2 px-4 ${activeTab === 'company' ? 'border-b-2 border-primary-600 text-primary-600 font-bold' : ''}`}>ملف الشركة</button>
                </div>

                <div className="flex justify-end mb-4">
                    {activeTab !== 'company' && (
                        <Button onClick={() => {
                            if (activeTab === 'expense') setExpenseShowForm(!expenseShowForm);
                            else if (activeTab === 'revenue') setRevenueShowForm(!revenueShowForm);
                            else {
                                if (!projectShowForm) {
                                    setProjectShowForm(true);
                                    setProjectFormData({ type_id: generateNextProjectId(), type_name: '' });
                                } else setProjectShowForm(false);
                            }
                        }}>
                            {activeTab === 'expense' ? (expenseShowForm ? 'إخفاء' : 'إضافة') :
                                activeTab === 'revenue' ? (revenueShowForm ? 'إخفاء' : 'إضافة') :
                                    (projectShowForm ? 'إخفاء' : 'إضافة نوع مشروع')}
                        </Button>
                    )}
                </div>

                {activeTab === 'company' && (
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleCompanySubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input
                                        label="اسم الشركة *"
                                        value={companyFormData.name}
                                        onChange={e => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">وصف مختصر للنشاط (يظهر في الهيدر) *</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-right"
                                        rows={3}
                                        value={companyFormData.description}
                                        onChange={e => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">عن الشركة (يظهر في الموقف المالي)</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-right"
                                        rows={4}
                                        value={companyFormData.about}
                                        onChange={e => setCompanyFormData({ ...companyFormData, about: e.target.value })}
                                    />
                                </div>
                                <Input
                                    label="العنوان"
                                    value={companyFormData.address}
                                    onChange={e => setCompanyFormData({ ...companyFormData, address: e.target.value })}
                                />
                                <Input
                                    label="رقم الهاتف"
                                    value={companyFormData.phone}
                                    onChange={e => setCompanyFormData({ ...companyFormData, phone: e.target.value })}
                                />
                                <Input
                                    label="البريد الإلكتروني"
                                    value={companyFormData.email}
                                    onChange={e => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                                />
                                <Input
                                    label="الموقع الإلكتروني"
                                    value={companyFormData.website}
                                    onChange={e => setCompanyFormData({ ...companyFormData, website: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-start">
                                <Button type="submit" size="lg">حفظ التغييرات</Button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'project' && (
                    <>
                        {projectShowForm && (
                            <form onSubmit={handleProjectSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="كود النوع *" value={projectFormData.type_id} onChange={e => setProjectFormData({ ...projectFormData, type_id: e.target.value })} disabled={projectEditing} required />
                                <Input label="اسم النوع *" value={projectFormData.type_name} onChange={e => setProjectFormData({ ...projectFormData, type_name: e.target.value })} required />
                                <div className="flex gap-2 mt-4">
                                    <Button type="submit">{projectEditing ? 'تحديث' : 'إضافة'}</Button>
                                    <Button type="button" variant="secondary" onClick={handleProjectCancel}>إلغاء</Button>
                                </div>
                            </form>
                        )}
                        {projectLoading ? <div className="text-center py-8">جاري التحميل...</div> : <Table columns={projectColumns} data={projectTypes} />}
                    </>
                )}

                {activeTab === 'expense' && (
                    <>
                        {expenseShowForm && (
                            <form onSubmit={handleExpenseSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="كود النوع *" value={expenseFormData.exptype_id} onChange={e => setExpenseFormData({ ...expenseFormData, exptype_id: e.target.value })} disabled={expenseEditing} required />
                                <Input label="اسم النوع *" value={expenseFormData.exptype_name} onChange={e => setExpenseFormData({ ...expenseFormData, exptype_name: e.target.value })} required />
                                <div className="flex gap-2 mt-4">
                                    <Button type="submit">{expenseEditing ? 'تحديث' : 'إضافة'}</Button>
                                    <Button type="button" variant="secondary" onClick={handleExpenseCancel}>إلغاء</Button>
                                </div>
                            </form>
                        )}
                        {expenseLoading ? <div className="text-center py-8">جاري التحميل...</div> : <Table columns={expenseColumns} data={expenseTypes} />}
                    </>
                )}

                {activeTab === 'revenue' && (
                    <>
                        {revenueShowForm && (
                            <form onSubmit={handleRevenueSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="كود النوع *" value={revenueFormData.revtype_id} onChange={e => setRevenueFormData({ ...revenueFormData, revtype_id: e.target.value })} disabled={revenueEditing} required />
                                <Input label="اسم النوع *" value={revenueFormData.revtype_name} onChange={e => setRevenueFormData({ ...revenueFormData, revtype_name: e.target.value })} required />
                                <div className="flex gap-2 mt-4">
                                    <Button type="submit">{revenueEditing ? 'تحديث' : 'إضافة'}</Button>
                                    <Button type="button" variant="secondary" onClick={handleRevenueCancel}>إلغاء</Button>
                                </div>
                            </form>
                        )}
                        {revenueLoading ? <div className="text-center py-8">جاري التحميل...</div> : <Table columns={revenueColumns} data={revenueTypes} />}
                    </>
                )}
            </Card>
        </div>
    );
};
