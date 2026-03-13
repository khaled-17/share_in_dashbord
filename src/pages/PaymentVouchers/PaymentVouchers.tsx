import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Table,
  Input,
  Drawer,
  Select,
} from "../../components/ui";
import toast, { Toaster } from "react-hot-toast";
import {
  paymentVoucherService,
  type PaymentVoucher,
} from "../../services/vouchers";
import { supplierService } from "../../services/suppliers";
import { employeeService } from "../../services/employees";
import { partnerService } from "../../services/partners";
import { settingsService } from "../../services/settings";

export const PaymentVouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    voucher_number: "",
    voucher_date: new Date().toISOString().split("T")[0],
    amount: "",
    beneficiary_type: "supplier",
    supplier_id: "",
    employee_id: "",
    partner_id: "",
    expense_type_id: "",
    payment_method: "cash",
    paid_to: "",
    description: "",
    // Check details
    check_number: "",
    bank_name: "",
    check_date: "",
    beneficiary_name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate next voucher number
  const generateNextVoucherNumber = () => {
    if (vouchers.length === 0) return "PV-2024-001";
    const validNumbers = vouchers
      .map((v) => v.voucher_number)
      .filter((num) => /^PV-\d{4}-\d{3}$/.test(num))
      .map((num) => parseInt(num.split("-")[2]))
      .filter((num) => !isNaN(num));
    if (validNumbers.length === 0) return "PV-2024-001";
    const maxNum = Math.max(...validNumbers);
    const year = new Date().getFullYear();
    return `PV-${year}-${(maxNum + 1).toString().padStart(3, "0")}`;
  };

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const data = await paymentVoucherService.getAll();
      setVouchers(data || []);
    } catch (err: any) {
      toast.error(`فشل في تحميل البيانات: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [suppliersData, employeesData, partnersData, expenseTypesData] =
        await Promise.all([
          supplierService.getAll(),
          employeeService.getAll(),
          partnerService.getAll(),
          settingsService.getExpenseTypes(),
        ]);
      setSuppliers(suppliersData || []);
      setEmployees(employeesData || []);
      setPartners(partnersData || []);
      setExpenseTypes(expenseTypesData || []);
    } catch (err: any) {
      toast.error(`فشل في تحميل البيانات المساعدة: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchRelatedData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      voucher_number: generateNextVoucherNumber(),
      voucher_date: new Date().toISOString().split("T")[0],
      amount: "",
      beneficiary_type: "supplier",
      supplier_id: "",
      employee_id: "",
      partner_id: "",
      expense_type_id: "",
      payment_method: "cash",
      paid_to: "",
      description: "",
      check_number: "",
      bank_name: "",
      check_date: "",
      beneficiary_name: "",
    });
    setErrors({});
    setShowDrawer(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.voucher_number.trim())
      newErrors.voucher_number = "رقم السند مطلوب";
    if (!formData.voucher_date) newErrors.voucher_date = "تاريخ السند مطلوب";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "المبلغ يجب أن يكون أكبر من صفر";
    if (!formData.paid_to.trim()) newErrors.paid_to = "اسم المدفوع له مطلوب";

    if (formData.beneficiary_type === "supplier" && !formData.supplier_id) {
      newErrors.supplier_id = "يجب اختيار المورد";
    }
    if (formData.beneficiary_type === "employee" && !formData.employee_id) {
      newErrors.employee_id = "يجب اختيار الموظف";
    }
    if (
      formData.beneficiary_type === "partner_withdrawal" &&
      !formData.partner_id
    ) {
      newErrors.partner_id = "يجب اختيار الشريك";
    }
    if (
      formData.beneficiary_type === "admin_expense" &&
      !formData.expense_type_id
    ) {
      newErrors.expense_type_id = "يجب اختيار نوع المصروف";
    }

    if (formData.payment_method === "check") {
      if (!formData.check_number.trim())
        newErrors.check_number = "رقم الشيك مطلوب";
      if (!formData.bank_name.trim()) newErrors.bank_name = "اسم البنك مطلوب";
      if (!formData.check_date) newErrors.check_date = "تاريخ الشيك مطلوب";
      if (!formData.beneficiary_name.trim())
        newErrors.beneficiary_name = "اسم المستفيد مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    const loadingToast = toast.loading("جاري إنشاء سند الصرف...");
    try {
      const payload: any = {
        voucher_number: formData.voucher_number.trim(),
        voucher_date: formData.voucher_date,
        amount: parseFloat(formData.amount),
        beneficiary_type: formData.beneficiary_type,
        payment_method: formData.payment_method,
        paid_to: formData.paid_to.trim(),
        description: formData.description.trim() || null,
        created_by: "النظام",
      };

      if (formData.beneficiary_type === "supplier") {
        payload.supplier_id = formData.supplier_id;
      } else if (formData.beneficiary_type === "employee") {
        payload.employee_id = formData.employee_id;
      } else if (formData.beneficiary_type === "partner_withdrawal") {
        payload.partner_id = parseInt(formData.partner_id);
      } else if (formData.beneficiary_type === "admin_expense") {
        payload.expense_type_id = formData.expense_type_id;
      }

      if (formData.payment_method === "check") {
        payload.check_details = {
          check_number: formData.check_number.trim(),
          bank_name: formData.bank_name.trim(),
          check_date: formData.check_date,
          beneficiary_name: formData.beneficiary_name.trim(),
          status: "pending",
        };
      }

      await paymentVoucherService.create(payload);
      toast.success("تم إنشاء سند الصرف بنجاح", { id: loadingToast });
      setShowDrawer(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.message || "فشل في إنشاء السند", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا السند؟ سيتم عكس تأثيره على رأس مال الشريك إن وجد.",
      )
    )
      return;

    const loadingToast = toast.loading("جاري الحذف...");
    try {
      await paymentVoucherService.delete(id);
      toast.success("تم الحذف بنجاح", { id: loadingToast });
      fetchVouchers();
    } catch (err: any) {
      toast.error(`فشل الحذف: ${err.message}`, { id: loadingToast });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  const getBeneficiaryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      supplier: "مورد",
      employee: "موظف",
      partner_withdrawal: "مسحوبات شريك",
      admin_expense: "مصروف إداري",
      other: "أخرى",
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "نقدي",
      check: "شيك",
      bank_transfer: "تحويل بنكي",
    };
    return labels[method] || method;
  };

  const columns = [
    {
      key: "voucher_number",
      header: "رقم السند",
      render: (v: PaymentVoucher) => (
        <span className="font-bold text-blue-600">{v.voucher_number}</span>
      ),
    },
    {
      key: "voucher_date",
      header: "التاريخ",
      render: (v: PaymentVoucher) => formatDate(v.voucher_date),
    },
    {
      key: "paid_to",
      header: "المدفوع له",
    },
    {
      key: "beneficiary_type",
      header: "نوع المستفيد",
      render: (v: PaymentVoucher) => (
        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
          {getBeneficiaryTypeLabel(v.beneficiary_type)}
        </span>
      ),
    },
    {
      key: "payment_method",
      header: "طريقة الدفع",
      render: (v: PaymentVoucher) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            v.payment_method === "cash"
              ? "bg-green-100 text-green-800"
              : v.payment_method === "check"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-purple-100 text-purple-800"
          }`}
        >
          {getPaymentMethodLabel(v.payment_method)}
        </span>
      ),
    },
    {
      key: "amount",
      header: "المبلغ",
      render: (v: PaymentVoucher) => (
        <span className="font-bold text-red-600">
          {formatCurrency(v.amount)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "الإجراءات",
      align: "left" as const,
      render: (v: PaymentVoucher) => (
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(v.id);
            }}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سندات الصرف</h1>
          <p className="text-gray-500">تسجيل ومتابعة جميع المدفوعات المالية</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          إنشاء سند صرف جديد
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
            emptyMessage="لا توجد سندات صرف مسجلة بعد"
          />
        )}
      </Card>

      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title="إنشاء سند صرف جديد"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم السند *"
              value={formData.voucher_number}
              onChange={(e) =>
                setFormData({ ...formData, voucher_number: e.target.value })
              }
              error={errors.voucher_number}
              required
            />
            <Input
              label="تاريخ السند *"
              type="date"
              value={formData.voucher_date}
              onChange={(e) =>
                setFormData({ ...formData, voucher_date: e.target.value })
              }
              error={errors.voucher_date}
              required
            />

            <div className="md:col-span-2">
              <Select
                label="نوع المستفيد *"
                value={formData.beneficiary_type}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    beneficiary_type: e.target.value,
                    supplier_id: "",
                    employee_id: "",
                    partner_id: "",
                    expense_type_id: "",
                  })
                }
                options={[
                  { value: "supplier", label: "مورد" },
                  { value: "employee", label: "موظف" },
                  { value: "partner_withdrawal", label: "مسحوبات شريك" },
                  { value: "admin_expense", label: "مصروف إداري" },
                  { value: "other", label: "أخرى" },
                ]}
                onAddClick={() => navigate("/settings")}
              />
            </div>

            {formData.beneficiary_type === "supplier" && (
              <div className="md:col-span-2">
                <Select
                  label="المورد *"
                  value={formData.supplier_id}
                  onChange={(e: any) => {
                    const selected = suppliers.find(
                      (s) => s.supplier_id === e.target.value,
                    );
                    setFormData({
                      ...formData,
                      supplier_id: e.target.value,
                      paid_to: selected?.name || "",
                    });
                  }}
                  options={[
                    { value: "", label: "اختر المورد" },
                    ...suppliers.map((s) => ({
                      value: s.supplier_id,
                      label: s.name,
                    })),
                  ]}
                  onAddClick={() => navigate("/suppliers")}
                  error={errors.supplier_id}
                />
              </div>
            )}

            {formData.beneficiary_type === "employee" && (
              <div className="md:col-span-2">
                <Select
                  label="الموظف *"
                  value={formData.employee_id}
                  onChange={(e: any) => {
                    const selected = employees.find(
                      (emp) => emp.emp_code === e.target.value,
                    );
                    setFormData({
                      ...formData,
                      employee_id: e.target.value,
                      paid_to: selected?.name || "",
                    });
                  }}
                  options={[
                    { value: "", label: "اختر الموظف" },
                    ...employees.map((emp) => ({
                      value: emp.emp_code,
                      label: emp.name,
                    })),
                  ]}
                  onAddClick={() => navigate("/employees")}
                  error={errors.employee_id}
                />
              </div>
            )}

            {formData.beneficiary_type === "partner_withdrawal" && (
              <div className="md:col-span-2">
                <Select
                  label="الشريك *"
                  value={formData.partner_id}
                  onChange={(e: any) => {
                    const selected = partners.find(
                      (p) => p.id === parseInt(e.target.value),
                    );
                    setFormData({
                      ...formData,
                      partner_id: e.target.value,
                      paid_to: selected?.name || "",
                    });
                  }}
                  options={[
                    { value: "", label: "اختر الشريك" },
                    ...partners.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                  onAddClick={() => navigate("/partners")}
                  error={errors.partner_id}
                />
              </div>
            )}

            {formData.beneficiary_type === "admin_expense" && (
              <div className="md:col-span-2">
                <Select
                  label="نوع المصروف *"
                  value={formData.expense_type_id}
                  onChange={(e: any) => {
                    const selected = expenseTypes.find(
                      (et) => et.exptype_id === e.target.value,
                    );
                    setFormData({
                      ...formData,
                      expense_type_id: e.target.value,
                      paid_to: selected?.exptype_name || "",
                    });
                  }}
                  options={[
                    { value: "", label: "اختر نوع المصروف" },
                    ...expenseTypes.map((et) => ({
                      value: et.exptype_id,
                      label: et.exptype_name,
                    })),
                  ]}
                  onAddClick={() => navigate("/settings")}
                  error={errors.expense_type_id}
                />
              </div>
            )}

            <Input
              label="المدفوع له *"
              value={formData.paid_to}
              onChange={(e) =>
                setFormData({ ...formData, paid_to: e.target.value })
              }
              error={errors.paid_to}
              placeholder="اسم الشخص أو الجهة"
              required
            />

            <Input
              label="المبلغ *"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              error={errors.amount}
              placeholder="0"
              required
            />

            <div className="md:col-span-2">
              <Select
                label="طريقة الدفع *"
                value={formData.payment_method}
                onChange={(e: any) =>
                  setFormData({ ...formData, payment_method: e.target.value })
                }
                options={[
                  { value: "cash", label: "نقدي" },
                  { value: "check", label: "شيك" },
                  { value: "bank_transfer", label: "تحويل بنكي" },
                ]}
                onAddClick={() => navigate("/settings")}
              />
            </div>

            {formData.payment_method === "check" && (
              <>
                <Input
                  label="رقم الشيك *"
                  value={formData.check_number}
                  onChange={(e) =>
                    setFormData({ ...formData, check_number: e.target.value })
                  }
                  error={errors.check_number}
                  required
                />
                <Input
                  label="اسم البنك *"
                  value={formData.bank_name}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_name: e.target.value })
                  }
                  error={errors.bank_name}
                  required
                />
                <Input
                  label="تاريخ الشيك *"
                  type="date"
                  value={formData.check_date}
                  onChange={(e) =>
                    setFormData({ ...formData, check_date: e.target.value })
                  }
                  error={errors.check_date}
                  required
                />
                <Input
                  label="اسم المستفيد *"
                  value={formData.beneficiary_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      beneficiary_name: e.target.value,
                    })
                  }
                  error={errors.beneficiary_name}
                  required
                />
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDrawer(false)}
            >
              إلغاء
            </Button>
            <Button type="submit">إنشاء السند</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
