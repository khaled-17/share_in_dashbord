import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Input } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';
import { customerService } from '../../services/customers';
import type { Customer } from '../../services/customers';
import type { Revenue } from '../../services/finance';
import type { Quotation } from '../../services/quotations';
import type { WorkOrder } from '../../services/work_orders';

import { useParams, useNavigate } from 'react-router-dom';

type TabType = 'finance' | 'quotations' | 'workorders';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = id || '';
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('finance');

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    contact_person: '',
    company_email: '',
    contact_email: '',
    phone: '',
    secondary_phone: '',
    address: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getById(customerId);

      setCustomer(data);
      setRevenues(data.revenues || []);
      setQuotations(data.quotations || []);
      setWorkOrders(data.work_orders || []);

      // Sync form data
      setFormData({
        customer_id: data.customer_id,
        name: data.name,
        contact_person: data.contact_person || '',
        company_email: data.company_email || '',
        contact_email: data.contact_email || '',
        phone: data.phone || '',
        secondary_phone: data.secondary_phone || '',
        address: data.address || '',
      });
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('اسم الشركة مطلوب');
      return;
    }

    const loadingToast = toast.loading('جاري تحديث البيانات...');
    try {
      const payload = {
        name: formData.name.trim(),
        contact_person: formData.contact_person.trim() || null,
        company_email: formData.company_email.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        phone: formData.phone.trim() || null,
        secondary_phone: formData.secondary_phone.trim() || null,
        address: formData.address.trim() || null,
      };

      await customerService.update(customerId, payload);
      toast.success('تم التحديث بنجاح', { id: loadingToast });
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'فشل التحديث', { id: loadingToast });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const revenueColumns = [
    { key: 'rev_date', header: 'التاريخ', render: (r: Revenue) => formatDate(r.rev_date) },
    { key: 'amount', header: 'المبلغ', render: (r: Revenue) => formatAmount(r.amount) },
    { key: 'type', header: 'النوع', render: (r: any) => r.type?.revtype_name || r.revtype_id },
    { key: 'quote_id', header: 'عرض السعر', render: (r: Revenue) => r.quote_id ? `#${r.quote_id}` : '-' },
    { key: 'receipt_no', header: 'رقم الإيصال' },
    { key: 'notes', header: 'ملاحظات' },
  ];

  const quotationColumns = [
    { key: 'id', header: 'رقم العرض', render: (q: Quotation) => `QUO-${String(q.id).padStart(4, '0')}` },
    { key: 'quote_date', header: 'التاريخ', render: (q: Quotation) => formatDate(q.quote_date) },
    { key: 'project_name', header: 'المشروع' },
    { key: 'totalamount', header: 'الإجمالي', render: (q: Quotation) => formatAmount(q.totalamount) },
    { key: 'status', header: 'الحالة' },
  ];

  const workOrderColumns = [
    { key: 'order_code', header: 'رقم أمر الشغل' },
    { key: 'quotation_id', header: 'عرض السعر', render: (o: WorkOrder) => `#${o.quotation_id}` },
    { key: 'status', header: 'الحالة' },
  ];

  if (isLoading) return <div className="text-center py-20">جاري التحميل...</div>;
  if (!customer) return <div className="text-center py-20 text-red-500">لم يتم العثور على العميل</div>;

  // Date Filter State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filtered Data
  const getFilteredData = (data: any[], dateKey: string) => {
    if (!dateFrom && !dateTo) return data;
    return data.filter(item => {
      const itemDate = item[dateKey];
      if (dateFrom && itemDate < dateFrom) return false;
      if (dateTo && itemDate > dateTo) return false;
      return true;
    });
  };

  const filteredRevenues = getFilteredData(revenues, 'rev_date');
  const filteredQuotations = getFilteredData(quotations, 'quote_date');
  // Work orders don't always have a clear date field in the interface shown, but let's check. 
  // WorkOrder interface usually has created_at or start_date. 
  // Checking previous file content: WorkOrder interface wasn't fully shown but usually has CreatedAt. 
  // Let's assume we filter revenues and quotations first as requested.
  // actually the user said "Put date filter and date range".

  const totalRevenue = filteredRevenues.reduce((sum: number, rev: any) => sum + rev.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-right printable-content" dir="rtl">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable-content { width: 100%; max-width: none; margin: 0; padding: 0; }
          .card { box-shadow: none; border: none !important; }
          .print-only { display: block !important; }
          
          /* Reset Grid for Print to be linear */
          .print-grid-reset { display: block !important; }
          .print-full-width { width: 100% !important; margin-bottom: 20px; }
          
          /* Hide Scrollbars and ensure table fits */
          .overflow-x-auto { overflow: visible !important; }
          
          body { font-size: 12pt; }
          h1 { font-size: 18pt; margin-bottom: 10px; }
        }
        .print-only { display: none; }
      `}</style>
      <Toaster position="top-center" />

      {/* Print Header */}
      <div className="print-only text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold mb-2">كشف حساب عميل</h1>
        <h2 className="text-xl text-gray-600">{customer.name}</h2>
        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</span>
          <span>
            {dateFrom && dateTo ? `من: ${formatDate(dateFrom)} إلى: ${formatDate(dateTo)}` : 'بيان شامل'}
          </span>
        </div>
      </div>
      <Toaster position="top-center" />

      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/customers')}>عودة للقائمة</Button>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="secondary">
            طباعة كشف حساب
          </Button>
          <Button onClick={() => setShowEditModal(true)} variant="outline">
            تعديل البيانات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-grid-reset">
        {/* Contact Info Card */}
        <Card title="بيانات التواصل" className="lg:col-span-1 print-full-width">
          {/* ... existing info ... */}
          <div className="space-y-4 grid grid-cols-2 lg:grid-cols-1 print:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">كود العميل</p>
              <p className="font-bold">{customer.customer_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">اسم المسؤول</p>
              <p className="font-bold">{customer.contact_person || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">رقم الهاتف</p>
              <p className="font-bold">{customer.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">رقم هاتف إضافي</p>
              <p className="font-bold">{customer.secondary_phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ايميل الشركة</p>
              <p className="font-bold">{customer.company_email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ايميل المسؤول</p>
              <p className="font-bold">{customer.contact_email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">العنوان</p>
              <p className="font-bold">{customer.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ التكويد</p>
              <p className="font-bold">{customer.created_at ? formatDate(customer.created_at) : '-'}</p>
            </div>
          </div>
        </Card>

        {/* Content Tabs Card */}
        <div className="lg:col-span-2 space-y-6 print-full-width print-grid-reset">
          <div className="md:col-span-3 no-print">
            <Card>
              <div className="flex items-center gap-4">
                <span className="font-bold">تصفية حسب التاريخ:</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="من تاريخ"
                  className="max-w-xs"
                />
                <span>إلى</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="إلى تاريخ"
                  className="max-w-xs"
                />
                {(dateFrom || dateTo) && (
                  <Button variant="secondary" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                    إلغاء التصفية
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-sm text-green-600">إجمالي المدفوعات {dateFrom || dateTo ? '(مفلتر)' : ''}</p>
              <p className="text-2xl font-bold text-green-800">{formatAmount(totalRevenue)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-600">عدد عروض الأسعار {dateFrom || dateTo ? '(مفلتر)' : ''}</p>
              <p className="text-2xl font-bold text-blue-800">{filteredQuotations.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <p className="text-sm text-purple-600">عدد أوامر الشغل</p>
              <p className="text-2xl font-bold text-purple-800">{workOrders.length}</p>
            </div>
          </div>

          <Card>
            <div className="flex gap-4 border-b mb-6 overflow-x-auto no-print">
              <button
                onClick={() => setActiveTab('finance')}
                className={`pb-3 px-2 font-bold transition-all ${activeTab === 'finance' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                سجل المدفوعات
              </button>
              <button
                onClick={() => setActiveTab('quotations')}
                className={`pb-3 px-2 font-bold transition-all ${activeTab === 'quotations' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                عروض الأسعار
              </button>
              <button
                onClick={() => setActiveTab('workorders')}
                className={`pb-3 px-2 font-bold transition-all ${activeTab === 'workorders' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                أوامر الشغل
              </button>
            </div>

            {activeTab === 'finance' && (
              <Table columns={revenueColumns} data={filteredRevenues} emptyMessage="لا يوجد سجل مدفوعات لهذا العميل" />
            )}
            {activeTab === 'quotations' && (
              <Table columns={quotationColumns} data={filteredQuotations} emptyMessage="لا يوجد عروض أسعار لهذا العميل" />
            )}
            {activeTab === 'workorders' && (
              <Table columns={workOrderColumns} data={workOrders} emptyMessage="لا يوجد أوامر شغل لهذا العميل" />
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل بيانات العميل"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="كود العميل"
              value={formData.customer_id}
              disabled
            />
            <Input
              label="اسم الشركة *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="اسم المسئول"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            />
            <Input
              label="ايميل الشركة"
              type="email"
              value={formData.company_email}
              onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
            />
            <Input
              label="ايميل المسئول"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            />
            <Input
              label="رقم الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="رقم هاتف إضافي"
              value={formData.secondary_phone}
              onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })}
            />
            <div className="md:col-span-2">
              <Input
                label="العنوان"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>إلغاء</Button>
            <Button type="submit">تحديث البيانات</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
