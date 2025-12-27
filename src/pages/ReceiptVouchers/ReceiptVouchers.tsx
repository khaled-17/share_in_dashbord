import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Drawer } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { receiptVoucherService, type ReceiptVoucher } from '../../services/vouchers';
import { customerService } from '../../services/customers';
import { partnerService } from '../../services/partners';

export const ReceiptVouchers: React.FC = () => {
    const [vouchers, setVouchers] = useState<ReceiptVoucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDrawer, setShowDrawer] = useState(false);

    const [customers, setCustomers] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        voucher_number: '',
        voucher_date: new Date().toISOString().split('T')[0],
        amount: '',
        source_type: 'customer',
        customer_id: '',
        partner_id: '',
        payment_method: 'cash',
        received_from: '',
        description: '',
        // Check details
        check_number: '',
        bank_name: '',
        check_date: '',
        beneficiary_name: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Generate next voucher number
    const generateNextVoucherNumber = () => {
        if (vouchers.length === 0) return 'RV-2024-001';
        const validNumbers = vouchers
            .map(v => v.voucher_number)
            .filter(num => /^RV-\d{4}-\d{3}$/.test(num))
            .map(num => parseInt(num.split('-')[2]))
            .filter(num => !isNaN(num));
        if (validNumbers.length === 0) return 'RV-2024-001';
        const maxNum = Math.max(...validNumbers);
        const year = new Date().getFullYear();
        return `RV-${year}-${(maxNum + 1).toString().padStart(3, '0')}`;
    };

    const fetchVouchers = async () => {
        try {
            setIsLoading(true);
            const data = await receiptVoucherService.getAll();
            setVouchers(data || []);
        } catch (err: any) {
            toast.error('فشل في تحميل البيانات: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRelatedData = async () => {
        try {
            const [customersData, partnersData] = await Promise.all([
                customerService.getAll(),
                partnerService.getAll()
            ]);
            setCustomers(customersData || []);
            setPartners(partnersData || []);
        } catch (err: any) {
            toast.error('فشل في تحميل البيانات المساعدة');
        }
    };

    useEffect(() => {
        fetchVouchers();
        fetchRelatedData();
    }, []);

    const handleOpenAdd = () => {
        setFormData({
            voucher_number: generateNextVoucherNumber(),
            voucher_date: new Date().toISOString().split('T')[0],
            amount: '',
            source_type: 'customer',
            customer_id: '',
            partner_id: '',
            payment_method: 'cash',
            received_from: '',
            description: '',
            check_number: '',
            bank_name: '',
            check_date: '',
            beneficiary_name: ''
        });
        setErrors({});
        setShowDrawer(true);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.voucher_number.trim()) newErrors.voucher_number = 'رقم السند مطلوب';
        if (!formData.voucher_date) newErrors.voucher_date = 'تاريخ السند مطلوب';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
        if (!formData.received_from.trim()) newErrors.received_from = 'اسم المستلم من مطلوب';

        if (formData.source_type === 'customer' && !formData.customer_id) {
            newErrors.customer_id = 'يجب اختيار العميل';
        }
        if (formData.source_type === 'partner_capital' && !formData.partner_id) {
            newErrors.partner_id = 'يجب اختيار الشريك';
        }

        if (formData.payment_method === 'check') {
            if (!formData.check_number.trim()) newErrors.check_number = 'رقم الشيك مطلوب';
            if (!formData.bank_name.trim()) newErrors.bank_name = 'اسم البنك مطلوب';
            if (!formData.check_date) newErrors.check_date = 'تاريخ الشيك مطلوب';
            if (!formData.beneficiary_name.trim()) newErrors.beneficiary_name = 'اسم المستفيد مطلوب';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('يرجى تصحيح الأخطاء في النموذج');
            return;
        }

        const loadingToast = toast.loading('جاري إنشاء سند القبض...');
        try {
            const payload: any = {
                voucher_number: formData.voucher_number.trim(),
                voucher_date: formData.voucher_date,
                amount: parseFloat(formData.amount),
                source_type: formData.source_type,
                payment_method: formData.payment_method,
                received_from: formData.received_from.trim(),
                description: formData.description.trim() || null,
                created_by: 'النظام' // يمكن تغييره لاحقاً للمستخدم الحالي
            };

            if (formData.source_type === 'customer') {
                payload.customer_id = formData.customer_id;
            } else if (formData.source_type === 'partner_capital') {
                payload.partner_id = parseInt(formData.partner_id);
            }

            if (formData.payment_method === 'check') {
                payload.check_details = {
                    check_number: formData.check_number.trim(),
                    bank_name: formData.bank_name.trim(),
                    check_date: formData.check_date,
                    beneficiary_name: formData.beneficiary_name.trim(),
                    status: 'pending'
                };
            }

            await receiptVoucherService.create(payload);
            toast.success('تم إنشاء سند القبض بنجاح', { id: loadingToast });
            setShowDrawer(false);
            fetchVouchers();
        } catch (err: any) {
            toast.error(err.message || 'فشل في إنشاء السند', { id: loadingToast });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا السند؟ سيتم عكس تأثيره على رأس المال إن وجد.')) return;

        const loadingToast = toast.loading('جاري الحذف...');
        try {
            await receiptVoucherService.delete(id);
            toast.success('تم الحذف بنجاح', { id: loadingToast });
            fetchVouchers();
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG');
    };

    const getSourceTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            customer: 'عميل',
            partner_capital: 'زيادة رأس مال',
            advance_payment: 'دفعة مقدمة',
            other: 'أخرى'
        };
        return labels[type] || type;
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            cash: 'نقدي',
            check: 'شيك',
            bank_transfer: 'تحويل بنكي'
        };
        return labels[method] || method;
    };

    const columns = [
        {
            key: 'voucher_number',
            header: 'رقم السند',
            render: (v: ReceiptVoucher) => (
                <span className="font-bold text-blue-600">{v.voucher_number}</span>
            )
        },
        {
            key: 'voucher_date',
            header: 'التاريخ',
            render: (v: ReceiptVoucher) => formatDate(v.voucher_date)
        },
        {
            key: 'received_from',
            header: 'المستلم من'
        },
        {
            key: 'source_type',
            header: 'نوع المصدر',
            render: (v: ReceiptVoucher) => (
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {getSourceTypeLabel(v.source_type)}
                </span>
            )
        },
        {
            key: 'payment_method',
            header: 'طريقة الدفع',
            render: (v: ReceiptVoucher) => (
                <span className={`px-2 py-1 rounded-full text-xs ${v.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                        v.payment_method === 'check' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                    }`}>
                    {getPaymentMethodLabel(v.payment_method)}
                </span>
            )
        },
        {
            key: 'amount',
            header: 'المبلغ',
            render: (v: ReceiptVoucher) => (
                <span className="font-bold text-green-600">{formatCurrency(v.amount)}</span>
            )
        },
        {
            key: 'actions',
            header: 'الإجراءات',
            align: 'left' as const,
            render: (v: ReceiptVoucher) => (
                <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}>
                        حذف
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 text-right" dir="rtl">
            <Toaster position="top-center" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">سندات القبض</h1>
                    <p className="text-gray-500">تسجيل ومتابعة جميع المقبوضات المالية</p>
                </div>
                <Button onClick={handleOpenAdd} className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إنشاء سند قبض جديد
                </Button>
            </div>

            <Card>
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">جاري تحميل السندات...</p>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={vouchers}
                        emptyMessage="لا توجد سندات قبض مسجلة بعد"
                    />
                )}
            </Card>

            <Drawer
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                title="إنشاء سند قبض جديد"
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="رقم السند *"
                            value={formData.voucher_number}
                            onChange={(e) => setFormData({ ...formData, voucher_number: e.target.value })}
                            error={errors.voucher_number}
                            required
                        />
                        <Input
                            label="تاريخ السند *"
                            type="date"
                            value={formData.voucher_date}
                            onChange={(e) => setFormData({ ...formData, voucher_date: e.target.value })}
                            error={errors.voucher_date}
                            required
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">نوع المصدر *</label>
                            <select
                                value={formData.source_type}
                                onChange={(e) => setFormData({ ...formData, source_type: e.target.value, customer_id: '', partner_id: '' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="customer">عميل</option>
                                <option value="partner_capital">زيادة رأس مال شريك</option>
                                <option value="advance_payment">دفعة مقدمة</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>

                        {formData.source_type === 'customer' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">العميل *</label>
                                <select
                                    value={formData.customer_id}
                                    onChange={(e) => {
                                        const selectedCustomer = customers.find(c => c.customer_id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            customer_id: e.target.value,
                                            received_from: selectedCustomer?.name || ''
                                        });
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.customer_id ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">اختر العميل</option>
                                    {customers.map(c => (
                                        <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.customer_id && <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>}
                            </div>
                        )}

                        {formData.source_type === 'partner_capital' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">الشريك *</label>
                                <select
                                    value={formData.partner_id}
                                    onChange={(e) => {
                                        const selectedPartner = partners.find(p => p.id === parseInt(e.target.value));
                                        setFormData({
                                            ...formData,
                                            partner_id: e.target.value,
                                            received_from: selectedPartner?.name || ''
                                        });
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.partner_id ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">اختر الشريك</option>
                                    {partners.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.partner_id && <p className="text-red-500 text-sm mt-1">{errors.partner_id}</p>}
                            </div>
                        )}

                        <Input
                            label="المستلم من *"
                            value={formData.received_from}
                            onChange={(e) => setFormData({ ...formData, received_from: e.target.value })}
                            error={errors.received_from}
                            placeholder="اسم الشخص أو الجهة"
                            required
                        />

                        <Input
                            label="المبلغ *"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            error={errors.amount}
                            placeholder="0"
                            required
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع *</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="cash">نقدي</option>
                                <option value="check">شيك</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                            </select>
                        </div>

                        {formData.payment_method === 'check' && (
                            <>
                                <Input
                                    label="رقم الشيك *"
                                    value={formData.check_number}
                                    onChange={(e) => setFormData({ ...formData, check_number: e.target.value })}
                                    error={errors.check_number}
                                    required
                                />
                                <Input
                                    label="اسم البنك *"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                    error={errors.bank_name}
                                    required
                                />
                                <Input
                                    label="تاريخ الشيك *"
                                    type="date"
                                    value={formData.check_date}
                                    onChange={(e) => setFormData({ ...formData, check_date: e.target.value })}
                                    error={errors.check_date}
                                    required
                                />
                                <Input
                                    label="اسم المستفيد *"
                                    value={formData.beneficiary_name}
                                    onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })}
                                    error={errors.beneficiary_name}
                                    required
                                />
                            </>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="أي ملاحظات إضافية..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={() => setShowDrawer(false)}>إلغاء</Button>
                        <Button type="submit">إنشاء السند</Button>
                    </div>
                </form>
            </Drawer>
        </div>
    );
};
