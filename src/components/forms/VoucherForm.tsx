import React, { useState } from 'react';
import { Card, Input, Select, Button } from '../ui';
import { validateRequired, validatePositiveNumber, getValidationError } from '../../utils';

interface VoucherFormData {
  voucherNumber: string;
  date: string;
  recipient: string;
  amount: number;
  description: string;
  paymentMethod: string;
}

interface VoucherFormProps {
  type: 'payment' | 'receipt';
  onSubmit: (data: VoucherFormData) => void;
  onCancel: () => void;
  initialData?: Partial<VoucherFormData>;
}

export const VoucherForm: React.FC<VoucherFormProps> = ({
  type,
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<VoucherFormData>({
    voucherNumber: initialData?.voucherNumber || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    recipient: initialData?.recipient || '',
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    paymentMethod: initialData?.paymentMethod || 'نقدي',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VoucherFormData, string>>>({});

  const handleChange = (field: keyof VoucherFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VoucherFormData, string>> = {};

    if (!validateRequired(formData.voucherNumber)) {
      newErrors.voucherNumber = getValidationError('رقم السند', 'required');
    }
    if (!validateRequired(formData.recipient)) {
      newErrors.recipient = getValidationError(type === 'payment' ? 'المستفيد' : 'العميل', 'required');
    }
    if (!validatePositiveNumber(formData.amount)) {
      newErrors.amount = getValidationError('المبلغ', 'positive');
    }
    if (!validateRequired(formData.description)) {
      newErrors.description = getValidationError('البيان', 'required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Card
      title={type === 'payment' ? 'سند صرف جديد' : 'سند قبض جديد'}
      subtitle="قم بملء جميع الحقول المطلوبة"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="رقم السند *"
            value={formData.voucherNumber}
            onChange={(e) => handleChange('voucherNumber', e.target.value)}
            error={errors.voucherNumber}
            placeholder="مثال: PAY-2025-001"
            fullWidth
          />

          <Input
            type="date"
            label="التاريخ *"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            fullWidth
          />

          <Input
            label={type === 'payment' ? 'المستفيد *' : 'العميل *'}
            value={formData.recipient}
            onChange={(e) => handleChange('recipient', e.target.value)}
            error={errors.recipient}
            placeholder="اسم المستفيد أو العميل"
            fullWidth
          />

          <Input
            type="number"
            label="المبلغ (ج.م) *"
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            error={errors.amount}
            placeholder="0.00"
            fullWidth
          />

          <Select
            label="طريقة الدفع *"
            value={formData.paymentMethod}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
            options={[
              { value: 'نقدي', label: 'نقدي' },
              { value: 'تحويل بنكي', label: 'تحويل بنكي' },
              { value: 'شيك', label: 'شيك' },
              { value: 'بطاقة ائتمان', label: 'بطاقة ائتمان' },
            ]}
            fullWidth
          />
        </div>

        <Input
          label="البيان *"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="وصف تفصيلي للعملية"
          fullWidth
        />

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            حفظ السند
          </Button>
        </div>
      </form>
    </Card>
  );
};
