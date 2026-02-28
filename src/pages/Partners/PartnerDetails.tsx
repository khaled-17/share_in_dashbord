import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { partnerService } from '../../services/partners';
import type { Partner, PartnerSummary } from '../../services/partners';

export const PartnerDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const partnerId = Number(id);

    const [partner, setPartner] = useState<Partner | null>(null);
    const [summary, setSummary] = useState<PartnerSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const fetchData = async () => {
        if (!partnerId) return;
        try {
            setIsLoading(true);
            const [p, s] = await Promise.all([
                partnerService.getById(partnerId),
                partnerService.getSummary(partnerId)
            ]);
            setPartner(p);
            setSummary(s);
            setFormData({ name: p.name, phone: p.phone ?? '', email: p.email ?? '' });
        } catch (err: any) {
            toast.error('فشل في تحميل بيانات الشريك: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [partnerId]);

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loading = toast.loading('جاري التحديث...');
        try {
            await partnerService.update(partnerId, {
                name: formData.name.trim(),
                phone: formData.phone.trim() || null,
                email: formData.email.trim() || null
            });
            toast.success('تم تحديث الشريك بنجاح', { id: loading });
            setShowEdit(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.message || 'فشل التحديث', { id: loading });
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0
        }).format(amount);

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
                <p className="text-gray-500">جاري تحميل بيانات الشريك...</p>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">لا توجد بيانات لهذا الشريك.</p>
                <Button onClick={() => navigate('/partners')}>العودة إلى القائمة</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <Toaster position="top-center" />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">تفاصيل الشريك: {partner.name}</h1>
                <Button onClick={() => setShowEdit(true)} variant="secondary">تعديل</Button>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong>كود الشريك:</strong> {partner.partner_code}</p>
                        <p><strong>اسم الشريك:</strong> {partner.name}</p>
                        <p><strong>رقم الهاتف:</strong> {partner.phone ?? '-'} </p>
                        <p><strong>البريد الإلكتروني:</strong> {partner.email ?? '-'} </p>
                    </div>
                    <div>
                        <p><strong>رأس المال الأولي:</strong> {formatCurrency(partner.initial_capital)}</p>
                        <p><strong>رأس المال الحالي:</strong> {formatCurrency(partner.current_capital)}</p>
                    </div>
                </div>
            </Card>

            {summary && (
                <Card>
                    <h2 className="text-xl font-semibold mb-4">ملخص مالي</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>إجمالي الزيادات (سندات القبض):</strong> {formatCurrency(summary.total_capital_increase)}</p>
                        <p><strong>إجمالي السحوبات (سندات الصرف):</strong> {formatCurrency(summary.total_withdrawals)}</p>
                        <p><strong>صافي رأس المال:</strong> {formatCurrency(summary.net_capital)}</p>
                    </div>
                </Card>
            )}

            {/* Edit Modal */}
            <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="تعديل بيانات الشريك">
                <form onSubmit={handleEdit} className="space-y-4">
                    <Input label="اسم الشريك" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="رقم الهاتف" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button type="button" variant="secondary" onClick={() => setShowEdit(false)}>إلغاء</Button>
                        <Button type="submit">حفظ التغييرات</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
