import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { checkService, type CheckStats } from '../../services/vouchers';

export const Checks: React.FC = () => {
    const [checks, setChecks] = useState<any[]>([]);
    const [stats, setStats] = useState<CheckStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [currentCheck, setCurrentCheck] = useState<any>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [statusNotes, setStatusNotes] = useState<string>('');

    const fetchChecks = async () => {
        try {
            setIsLoading(true);
            const data = await checkService.getAll({ status: filterStatus });
            setChecks(data || []);

            const statsData = await checkService.getStats();
            setStats(statsData);
        } catch (err: any) {
            toast.error('فشل في تحميل البيانات: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChecks();
    }, [filterStatus]);

    const handleUpdateStatus = async () => {
        if (!currentCheck || !newStatus) return;

        const loadingToast = toast.loading('جاري تحديث حالة الشيك...');
        try {
            await checkService.updateStatus(currentCheck.id, {
                status: newStatus,
                notes: statusNotes
            });
            toast.success('تم تحديث حالة الشيك بنجاح', { id: loadingToast });
            setShowStatusModal(false);
            fetchChecks();
        } catch (err: any) {
            toast.error('فشل التحديث: ' + err.message, { id: loadingToast });
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

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'قيد الانتظار',
            cleared: 'تم الصرف',
            bounced: 'مرتد',
            cancelled: 'ملغى'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            cleared: 'bg-green-100 text-green-800',
            bounced: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-blue-100 text-blue-800';
    };

    const columns = [
        {
            key: 'check_number',
            header: 'رقم الشيك',
            render: (c: any) => <span className="font-bold">{c.check_number}</span>
        },
        {
            key: 'bank_name',
            header: 'البنك'
        },
        {
            key: 'check_date',
            header: 'تاريخ الاستحقاق',
            render: (c: any) => formatDate(c.check_date)
        },
        {
            key: 'beneficiary_name',
            header: 'المستفيد'
        },
        {
            key: 'amount',
            header: 'المبلغ',
            render: (c: any) => <span className="font-bold">{formatCurrency(c.amount)}</span>
        },
        {
            key: 'type',
            header: 'النوع',
            render: (c: any) => (
                <span className={`px-2 py-1 rounded-full text-xs ${c.receipt_voucher_id ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {c.receipt_voucher_id ? 'شيك وارد (قبض)' : 'شيك صادر (صرف)'}
                </span>
            )
        },
        {
            key: 'status',
            header: 'الحالة',
            render: (c: any) => (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(c.status)}`}>
                    {getStatusLabel(c.status)}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'الإجراءات',
            align: 'left' as const,
            render: (c: any) => (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                        setCurrentCheck(c);
                        setNewStatus(c.status);
                        setStatusNotes(c.notes || '');
                        setShowStatusModal(true);
                    }}
                >
                    تحديث الحالة
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6 text-right" dir="rtl">
            <Toaster position="top-center" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الشيكات</h1>
                    <p className="text-gray-500">متابعة جميع الشيكات الواردة والصادرة وحالاتها</p>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white border-r-4 border-blue-500">
                        <p className="text-sm text-gray-500">إجمالي الشيكات</p>
                        <h3 className="text-2xl font-bold">{stats.total_count} شيك</h3>
                        <p className="text-xs text-blue-600 font-semibold mt-1">{formatCurrency(stats.total_amount)}</p>
                    </Card>
                    <Card className="bg-white border-r-4 border-yellow-500">
                        <p className="text-sm text-gray-500">قيد الانتظار</p>
                        <h3 className="text-2xl font-bold text-yellow-600">{stats.by_status.pending}</h3>
                    </Card>
                    <Card className="bg-white border-r-4 border-green-500">
                        <p className="text-sm text-gray-500">تم الصرف</p>
                        <h3 className="text-2xl font-bold text-green-600">{stats.by_status.cleared}</h3>
                    </Card>
                    <Card className="bg-white border-r-4 border-red-500">
                        <p className="text-sm text-gray-500">مرتدة / ملغاة</p>
                        <h3 className="text-2xl font-bold text-red-600">{stats.by_status.bounced + stats.by_status.cancelled}</h3>
                    </Card>
                </div>
            )}

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 mb-1">تصفية حسب الحالة</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">جميع الحالات</option>
                            <option value="pending">قيد الانتظار</option>
                            <option value="cleared">تم الصرف</option>
                            <option value="bounced">مرتد</option>
                            <option value="cancelled">ملغى</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">جاري تحميل الشيكات...</p>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={checks}
                        emptyMessage="لا توجد شيكات مطابقة للبحث"
                    />
                )}
            </Card>

            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="تحديث حالة الشيك"
            >
                <div className="space-y-4">
                    {currentCheck && (
                        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                            <p><span className="font-semibold">رقم الشيك:</span> {currentCheck.check_number}</p>
                            <p><span className="font-semibold">المستفيد:</span> {currentCheck.beneficiary_name}</p>
                            <p><span className="font-semibold">المبلغ:</span> {formatCurrency(currentCheck.amount)}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الحالة الجديدة *</label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="pending">قيد الانتظار</option>
                            <option value="cleared">تم الصرف</option>
                            <option value="bounced">مرتد</option>
                            <option value="cancelled">ملغى</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                        <textarea
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
                            rows={3}
                            placeholder="مثلاً: سبب الارتداد، رقم إيصال الصرف..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="secondary" onClick={() => setShowStatusModal(false)}>إلغاء</Button>
                        <Button onClick={handleUpdateStatus}>تحديث الحالة</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
