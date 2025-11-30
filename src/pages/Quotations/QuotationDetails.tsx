import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface QuotationDetails {
    id: number;
    quote_id: number;
    customer_id: string;
    supplier_id: string;
    event_name: string;
    quote_date: string;
    delivery_date: string;
    totalamount: number;
    paid_adv: number;
    adv_date: string;
    receipt_no: string;
    status: string;
    customer_name?: string;
    supplier_name?: string;
}

export const QuotationDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quotation, setQuotation] = useState<QuotationDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchQuotationDetails();
    }, [id]);

    const fetchQuotationDetails = async () => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('quotations')
                .select(`
          *,
          customers (name),
          suppliers (name)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            setQuotation({
                ...data,
                customer_name: (data.customers as any)?.name,
                supplier_name: (data.suppliers as any)?.name,
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
            const { error } = await supabase
                .from('quotations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('تم حذف عرض السعر بنجاح', { id: loadingToast });
            navigate('/quotations');
        } catch (err: any) {
            toast.error('حدث خطأ أثناء الحذف: ' + err.message, { id: loadingToast });
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        const loadingToast = toast.loading('جاري تحديث الحالة...');

        try {
            const { error } = await supabase
                .from('quotations')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

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

    const quotationNumber = quotation.quote_id
        ? `QUO-${String(quotation.quote_id).padStart(4, '0')}`
        : `QUO-${String(quotation.id).padStart(4, '0')}`;

    const remainingAmount = quotation.totalamount - (quotation.paid_adv || 0);

    return (
        <>
            <Toaster position="top-center" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" onClick={() => navigate('/quotations')}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            رجوع
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">عرض السعر {quotationNumber}</h1>
                            <p className="text-sm text-gray-500">تفاصيل عرض السعر الكاملة</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            طباعة
                        </Button>
                        <Button variant="secondary" onClick={handleEdit}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            تعديل
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            حذف
                        </Button>
                    </div>
                </div>

                {/* Status Card */}
                <Card>
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
                            {quotation.status !== 'مرسل' && (
                                <Button size="sm" onClick={() => handleStatusChange('مرسل')}>
                                    تحديد كـ مرسل
                                </Button>
                            )}
                            {quotation.status !== 'مقبول' && (
                                <Button size="sm" variant="success" onClick={() => handleStatusChange('مقبول')}>
                                    تحديد كـ مقبول
                                </Button>
                            )}
                            {quotation.status !== 'مرفوض' && (
                                <Button size="sm" variant="danger" onClick={() => handleStatusChange('مرفوض')}>
                                    تحديد كـ مرفوض
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer & Supplier Info */}
                        <Card title="معلومات العميل والمورد">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">العميل</p>
                                    <Link
                                        to={`/customers/${quotation.customer_id}`}
                                        className="text-lg font-semibold text-blue-600 hover:underline"
                                    >
                                        {quotation.customer_name || 'غير محدد'}
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">المورد</p>
                                    {quotation.supplier_id ? (
                                        <Link
                                            to={`/suppliers/${quotation.supplier_id}`}
                                            className="text-lg font-semibold text-blue-600 hover:underline"
                                        >
                                            {quotation.supplier_name || 'غير محدد'}
                                        </Link>
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">-</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Event & Dates */}
                        <Card title="تفاصيل المناسبة والتواريخ">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">اسم المناسبة</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {quotation.event_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">تاريخ العرض</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {new Date(quotation.quote_date).toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">تاريخ التسليم</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {quotation.delivery_date
                                            ? new Date(quotation.delivery_date).toLocaleDateString('ar-EG')
                                            : '-'
                                        }
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Payment Details */}
                        <Card title="تفاصيل الدفع">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">رقم الإيصال</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {quotation.receipt_no || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">تاريخ الدفعة المقدمة</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {quotation.adv_date
                                            ? new Date(quotation.adv_date).toLocaleDateString('ar-EG')
                                            : '-'
                                        }
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Financial Summary */}
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

                        {/* Quick Stats */}
                        <Card>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">رقم العرض</p>
                                        <p className="font-mono font-semibold text-blue-600">{quotationNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">تاريخ الإنشاء</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(quotation.quote_date).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};
