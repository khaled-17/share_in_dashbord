import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { partnerService } from '../../services/partners';
import type { Partner } from '../../services/partners';
import { useNavigate } from 'react-router-dom';

export const Partners: React.FC = () => {
    const navigate = useNavigate();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        partner_code: '',
        name: '',
        phone: '',
        email: '',
        initial_capital: ''
    });
    const [showModal, setShowModal] = useState(false);

    // Generate next partner code
    const generateNextCode = () => {
        if (partners.length === 0) return 'P001';
        const validCodes = partners
            .map(p => p.partner_code)
            .filter(code => /^P\d+$/.test(code))
            .map(code => parseInt(code.substring(1)))
            .filter(num => !isNaN(num));
        if (validCodes.length === 0) return 'P001';
        const maxCode = Math.max(...validCodes);
        return 'P' + (maxCode + 1).toString().padStart(3, '0');
    };

    const fetchPartners = async () => {
        try {
            setIsLoading(true);
            const data = await partnerService.getAll();
            setPartners(data || []);
        } catch (err: any) {
            toast.error('فشل في تحميل البيانات: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleOpenAdd = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({
            partner_code: generateNextCode(),
            name: '',
            phone: '',
            email: '',
            initial_capital: ''
        });
        setShowModal(true);
    };

    const handleEdit = (partner: Partner) => {
        setIsEditing(true);
        setCurrentId(partner.id);
        setFormData({
            partner_code: partner.partner_code,
            name: partner.name,
            phone: partner.phone || '',
            email: partner.email || '',
            initial_capital: partner.initial_capital.toString()
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('اسم الشريك مطلوب');
            return;
        }

        const loadingToast = toast.loading(isEditing ? 'جاري التحديث...' : 'جاري الإضافة...');
        try {
            if (isEditing && currentId !== null) {
                await partnerService.update(currentId, {
                    name: formData.name.trim(),
                    phone: formData.phone.trim() || null,
                    email: formData.email.trim() || null
                });
                toast.success('تم تحديث بيانات الشريك بنجاح', { id: loadingToast });
            } else {
                await partnerService.create({
                    partner_code: formData.partner_code.trim(),
                    name: formData.name.trim(),
                    phone: formData.phone.trim() || null,
                    email: formData.email.trim() || null,
                    initial_capital: parseFloat(formData.initial_capital) || 0
                });
                toast.success('تم إضافة الشريك بنجاح', { id: loadingToast });
            }
            setShowModal(false);
            fetchPartners();
        } catch (err: any) {
            const errorMsg = err.message || '';
            if (errorMsg.includes('بالفعل')) {
                toast.error('عذراً، كود الشريك هذا تم استخدامه مسبقاً', { id: loadingToast, duration: 5000 });
            } else {
                toast.error(errorMsg || 'فشل في العملية', { id: loadingToast });
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الشريك؟')) return;
        const loadingToast = toast.loading('جاري الحذف...');
        try {
            await partnerService.delete(id);
            toast.success('تم الحذف بنجاح', { id: loadingToast });
            fetchPartners();
        } catch (err: any) {
            toast.error('فشل الحذف: ' + err.message, { id: loadingToast });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const columns = [
        {
            key: 'name',
            header: 'اسم الشريك',
            render: (p: Partner) => (
                <span className="font-bold text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/partners/${p.id}`)}>
                    {p.name}
                </span>
            )
        },
        { key: 'phone', header: 'رقم الهاتف' },
        { key: 'email', header: 'البريد الإلكتروني' },
        {
            key: 'initial_capital',
            header: 'رأس المال الأولي',
            render: (p: Partner) => formatCurrency(p.initial_capital)
        },
        {
            key: 'current_capital',
            header: 'رأس المال الحالي',
            render: (p: Partner) => (
                <span className={p.current_capital >= p.initial_capital ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {formatCurrency(p.current_capital)}
                </span>
            )
        },
        {
            key: 'partner_code',
            header: 'كود الشريك',
            align: 'center' as const,
            width: '100px'
        },
        {
            key: 'actions',
            header: 'الإجراءات',
            align: 'left' as const,
            render: (p: Partner) => (
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(p); }}>تعديل</Button>
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/partners/${p.id}`); }}>تفاصيل</Button>
                    <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}>حذف</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 text-right" dir="rtl">
            <Toaster position="top-center" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الشركاء</h1>
                    <p className="text-gray-500">مشاهدة وإدارة جميع بيانات الشركاء ورأس المال</p>
                </div>
                <Button onClick={handleOpenAdd} className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة شريك جديد
                </Button>
            </div>

            <Card>
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">جاري تحميل الشركاء...</p>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={partners}
                        emptyMessage="لا يوجد شركاء مضافين بعد"
                        onRowClick={(p) => navigate(`/partners/${p.id}`)}
                    />
                )}
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={isEditing ? 'تعديل بيانات الشريك' : 'إضافة شريك جديد'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="كود الشريك *"
                            value={formData.partner_code}
                            onChange={(e) => setFormData({ ...formData, partner_code: e.target.value })}
                            disabled={isEditing}
                            required
                        />
                        <Input
                            label="اسم الشريك *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="الاسم الكامل"
                            required
                        />
                        <Input
                            label="رقم الهاتف"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="01XXXXXXXXX"
                        />
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="partner@example.com"
                        />
                        {!isEditing && (
                            <div className="md:col-span-2">
                                <Input
                                    label="رأس المال الأولي *"
                                    type="number"
                                    value={formData.initial_capital}
                                    onChange={(e) => setFormData({ ...formData, initial_capital: e.target.value })}
                                    placeholder="0"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">يمكن زيادة رأس المال لاحقاً عن طريق سندات القبض</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>إلغاء</Button>
                        <Button type="submit">{isEditing ? 'تحديث البيانات' : 'إضافة الشريك'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
