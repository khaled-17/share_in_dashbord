import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { quotationService } from '../../services/quotations';

interface QuotationDetailsData {
    id: number;
    customer_id: string;
    project_type?: any;
    project_manager?: string | null;
    project_name?: string | null;
    quote_date: string;
    delivery_date?: string | null;
    totalamount: number;
    paid_adv?: number | null;
    adv_date?: string | null;
    receipt_no?: string | null;
    status: string;
    customer_name?: string;
    items?: any[];
}

export const QuotationDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quotation, setQuotation] = useState<QuotationDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchQuotationDetails();
        }
    }, [id]);

    const fetchQuotationDetails = async () => {
        try {
            setIsLoading(true);

            const data = await quotationService.getById(parseInt(id!));

            setQuotation({
                ...data,
                customer_name: data.customer?.name,
                project_type: data.project_type?.type_name || data.project_type_id
            });
        } catch (err: any) {
            toast.error('فشل في تحميل تفاصيل عرض السعر: ' + err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleEdit = () => {
        navigate('/quotations', { state: { editId: id } });
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف عرض السعر هذا؟')) return;

        const loadingToast = toast.loading('جاري الحذف...');

        try {
            await quotationService.delete(parseInt(id!));

            toast.success('تم حذف عرض السعر بنجاح', { id: loadingToast });
            navigate('/quotations');
        } catch (err: any) {
            toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        const loadingToast = toast.loading('جاري تحديث الحالة...');

        try {
            await quotationService.update(parseInt(id!), { status: newStatus });

            toast.success('تم تحديث الحالة بنجاح', { id: loadingToast });
            await fetchQuotationDetails();
        } catch (err: any) {
            toast.error('فشل في تحديث الحالة: ' + err.message, { id: loadingToast });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!quotation) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">عرض السعر غير موجود</h3>
                    <p className="text-gray-600 mb-4">لم يتم العثور على عرض السعر المطلوب</p>
                    <Button onClick={() => navigate('/quotations')}>العودة إلى قائمة العروض</Button>
                </div>
            </div>
        );
    }

    const quotationNumber = `QUO-${String(quotation.id).padStart(4, '0')}`;
    const remainingAmount = quotation.totalamount - (quotation.paid_adv || 0);

    return (
        <>
            <Toaster position="top-center" />

            <div className="space-y-6 text-right" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between no-print">
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" onClick={() => navigate('/quotations')}>
                            رجوع
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">عرض السعر {quotationNumber}</h1>
                            <p className="text-sm text-gray-500">{quotation.project_name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            طباعة
                        </Button>
                        <Button variant="secondary" onClick={handleEdit}>
                            تعديل
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            حذف
                        </Button>
                    </div>
                </div>

                {/* Status Card */}
                <Card className="no-print">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-2">حالة عرض السعر</p>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${quotation.status === 'مقبول'
                                ? 'bg-green-100 text-green-700'
                                : quotation.status === 'مرسل'
                                    ? 'bg-blue-100 text-blue-700'
                                    : quotation.status === 'مسودة'
                                        ? 'bg-gray-100 text-gray-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                {quotation.status}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleStatusChange('مرسل')}>مرسل</Button>
                            <Button size="sm" variant="success" onClick={() => handleStatusChange('مقبول')}>مقبول</Button>
                            <Button size="sm" variant="danger" onClick={() => handleStatusChange('مرفوض')}>مرفوض</Button>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Info */}
                        <Card title="تفاصيل المشروع">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">اسم العميل</p>
                                    <p className="text-lg font-bold text-blue-600">{quotation.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">اسم المشروع</p>
                                    <p className="text-lg font-bold text-gray-900">{quotation.project_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">نوع المشروع</p>
                                    <p className="text-base font-medium text-gray-900">{quotation.project_type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">المسؤول عن المشروع</p>
                                    <p className="text-base font-medium text-gray-900">{quotation.project_manager || '-'}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Items Table */}
                        <Card title="محتوى عرض السعر">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر الوحده</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العدد</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {quotation.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit_price.toLocaleString('ar-EG')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.total.toLocaleString('ar-EG')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card title="الملخص المالي">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b">
                                    <span className="text-gray-600">المبلغ الإجمالي</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {quotation.totalamount.toLocaleString('ar-EG')} ج.م
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b">
                                    <span className="text-gray-600">المبلغ المدفوع مقدماً</span>
                                    <span className="text-lg font-semibold text-green-600">
                                        {(quotation.paid_adv || 0).toLocaleString('ar-EG')} ج.م
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-900 font-semibold">المبلغ المتبقي</span>
                                    <span className="text-2xl font-bold text-primary-600">
                                        {remainingAmount.toLocaleString('ar-EG')} ج.م
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card title="مواعيد وتواريخ">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">تاريخ العرض</span>
                                    <span className="font-medium text-gray-900">{new Date(quotation.quote_date).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">تاريخ التسليم المتوقع</span>
                                    <span className="font-medium text-gray-900">{quotation.delivery_date ? new Date(quotation.delivery_date).toLocaleDateString('ar-EG') : '-'}</span>
                                </div>
                                {quotation.receipt_no && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-sm">رقم الإيصال</span>
                                        <span className="font-medium text-gray-900">{quotation.receipt_no}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};
