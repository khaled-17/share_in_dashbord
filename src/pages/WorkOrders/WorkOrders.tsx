import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Select } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { workOrderService, type WorkOrder } from '../../services/work_orders';
import { quotationService, type Quotation } from '../../services/quotations';
import { customerService, type Customer } from '../../services/customers';

export const WorkOrders: React.FC = () => {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        order_code: '',
        quotation_id: '',
        customer_id: '',
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [orders, quotes, custs] = await Promise.all([
                workOrderService.getAll(),
                quotationService.getAll(),
                customerService.getAll()
            ]);
            setWorkOrders(orders || []);
            setQuotations(quotes || []);
            setCustomers(custs || []);
        } catch (err: any) {
            toast.error('فشل في تحميل البيانات: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.order_code || !formData.quotation_id || !formData.customer_id) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        const loadingToast = toast.loading('جاري إضافة أمر التشغيل...');
        try {
            await workOrderService.create({
                order_code: formData.order_code,
                quotation_id: parseInt(formData.quotation_id),
                customer_id: formData.customer_id
            });
            toast.success('تم إضافة أمر التشغيل بنجاح', { id: loadingToast });
            setShowForm(false);
            setFormData({ order_code: '', quotation_id: '', customer_id: '' });
            await fetchData();
        } catch (err: any) {
            toast.error('حدث خطأ: ' + err.message, { id: loadingToast });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف أمر التشغيل هذا؟')) return;
        try {
            await workOrderService.delete(id);
            toast.success('تم الحذف بنجاح');
            await fetchData();
        } catch (err: any) {
            toast.error('فشل في الحذف: ' + err.message);
        }
    };

    const columns = [
        { key: 'order_code', header: 'كود أمر التشغيل' },
        {
            key: 'quotation',
            header: 'رقم عرض السعر',
            render: (item: WorkOrder) => item.quotation ? `QUO-${String(item.quotation.id).padStart(4, '0')}` : '-'
        },
        {
            key: 'customer',
            header: 'اسم العميل',
            render: (item: WorkOrder) => item.customer?.name || '-'
        },
        {
            key: 'project_name',
            header: 'اسم المشروع',
            render: (item: WorkOrder) => item.quotation?.project_name || '-'
        },
        {
            key: 'created_at',
            header: 'تاريخ الإنشاء',
            render: (item: WorkOrder) => item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : '-'
        },
        {
            key: 'actions',
            header: 'الإجراءات',
            render: (item: WorkOrder) => (
                <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>حذف</Button>
            )
        }
    ];

    const quotationOptions = quotations.map(q => ({
        value: q.id.toString(),
        label: `QUO-${String(q.id).padStart(4, '0')} - ${q.project_name}`
    }));
    const customerOptions = customers.map(c => ({ value: c.customer_id, label: c.name }));

    return (
        <div className="space-y-6 text-right" dir="rtl">
            <Toaster position="top-center" />
            <Card
                title="أوامر التشغيل"
                headerAction={
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'إخفاء النموذج' : 'إضافة أمر تشغيل'}
                    </Button>
                }
            >
                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                label="كود أمر التشغيل *"
                                value={formData.order_code}
                                onChange={(e) => setFormData({ ...formData, order_code: e.target.value })}
                                required
                            />
                            <Select
                                label="عرض السعر المرتبط *"
                                value={formData.quotation_id}
                                onChange={(e) => setFormData({ ...formData, quotation_id: e.target.value })}
                                options={quotationOptions}
                                required
                            />
                            <Select
                                label="العميل *"
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                options={customerOptions}
                                required
                            />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button type="submit">حفظ</Button>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>إلغاء</Button>
                        </div>
                    </form>
                )}

                {isLoading ? (
                    <div className="text-center py-8">جاري التحميل...</div>
                ) : (
                    <Table data={workOrders} columns={columns} />
                )}
            </Card>
        </div>
    );
};
