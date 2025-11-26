import React, { useState } from 'react';
import { Card, Input, Button } from '../ui';
import { validateRequired, getValidationError } from '../../utils';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuotationFormData {
  quotationNumber: string;
  date: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  validUntil: string;
  items: QuotationItem[];
  notes: string;
}

interface QuotationFormProps {
  onSubmit: (data: QuotationFormData) => void;
  onCancel: () => void;
  initialData?: Partial<QuotationFormData>;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<QuotationFormData>({
    quotationNumber: initialData?.quotationNumber || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    clientName: initialData?.clientName || '',
    clientPhone: initialData?.clientPhone || '',
    clientEmail: initialData?.clientEmail || '',
    validUntil: initialData?.validUntil || '',
    items: initialData?.items || [],
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: keyof QuotationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!validateRequired(formData.quotationNumber)) {
      newErrors.quotationNumber = getValidationError('رقم العرض', 'required');
    }
    if (!validateRequired(formData.clientName)) {
      newErrors.clientName = getValidationError('اسم العميل', 'required');
    }
    if (formData.items.length === 0) {
      newErrors.items = 'يجب إضافة صنف واحد على الأقل';
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
    <Card title="عرض سعر جديد" subtitle="قم بملء بيانات العميل والأصناف">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">بيانات العميل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم العرض *"
              value={formData.quotationNumber}
              onChange={(e) => handleChange('quotationNumber', e.target.value)}
              error={errors.quotationNumber}
              placeholder="QUO-2025-001"
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
              label="اسم العميل *"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              error={errors.clientName}
              placeholder="اسم العميل أو الشركة"
              fullWidth
            />

            <Input
              label="رقم الهاتف"
              value={formData.clientPhone}
              onChange={(e) => handleChange('clientPhone', e.target.value)}
              placeholder="01xxxxxxxxx"
              fullWidth
            />

            <Input
              type="email"
              label="البريد الإلكتروني"
              value={formData.clientEmail}
              onChange={(e) => handleChange('clientEmail', e.target.value)}
              placeholder="client@example.com"
              fullWidth
            />

            <Input
              type="date"
              label="صالح حتى"
              value={formData.validUntil}
              onChange={(e) => handleChange('validUntil', e.target.value)}
              fullWidth
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">الأصناف</h3>
            <Button type="button" variant="primary" size="sm" onClick={addItem}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة صنف
            </Button>
          </div>

          {errors.items && (
            <p className="text-sm text-red-600">{errors.items}</p>
          )}

          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      label={`الصنف ${index + 1}`}
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="وصف الصنف"
                      fullWidth
                    />
                  </div>
                  <Input
                    type="number"
                    label="الكمية"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                  <Input
                    type="number"
                    label="سعر الوحدة"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="label">الإجمالي</label>
                      <div className="input-field bg-gray-100">
                        {item.total.toLocaleString('ar-EG')} ج.م
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/3 p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">المبلغ الإجمالي:</span>
              <span className="text-2xl font-bold text-primary-600">
                {calculateTotal().toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">ملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input-field min-h-[100px]"
            placeholder="أي ملاحظات إضافية..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit" variant="success">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            حفظ العرض
          </Button>
        </div>
      </form>
    </Card>
  );
};
