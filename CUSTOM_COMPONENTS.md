# Custom Components Guide

## Select Component (Add-New Navigation Pattern)

`Select` هو كومبوننت مخصص في المشروع يدعم سيناريو مهم:

- المستخدم يفتح Dropdown
- لا يجد العنصر المطلوب
- يضغط `➕ إضافة جديد`
- يتم نقله مباشرة لصفحة الإدارة المناسبة
- بعد الإضافة يرجع ويكمل نفس الفورم

الهدف هو تقليل تعطيل سير العمل بدل ما المستخدم يسيب الشاشة ويدور يدويًا.

## File Location

- `src/components/ui/Select.tsx`

## Props API

- `label?: string`
- `error?: string`
- `options: { value: string | number; label: string }[]`
- `fullWidth?: boolean`
- `onAddClick?: () => void`
- يدعم أيضًا باقي خصائص `<select>` القياسية

## How It Works

عند تمرير `onAddClick`:

1. الكومبوننت يضيف خيار تلقائي أعلى القائمة بقيمة `ADD_NEW` وعنوان `➕ إضافة جديد`.
2. عند اختياره يتم استدعاء `onAddClick`.
3. يتم إعادة قيمة الـ select إلى القيمة السابقة حتى لا تظل `ADD_NEW` مختارة.

بدون `onAddClick`:

- الكومبوننت يعمل كـ Select طبيعي بدون خيار الإضافة.

## Usage Example

```tsx
<Select
  label="نوع المشروع *"
  value={formData.project_type_id}
  onChange={e => setFormData({ ...formData, project_type_id: e.target.value })}
  options={projectTypeOptions}
  onAddClick={() => navigate('/settings')}
  error={formErrors.project_type_id}
/>
```

## Navigation Mapping (Recommended)

- العميل -> `navigate('/customers')`
- المورد -> `navigate('/suppliers')`
- الشريك -> `navigate('/partners')`
- الموظف -> `navigate('/employees')`
- أنواع الإيراد/المصروف/المشروع -> `navigate('/settings')`
- عرض سعر مرتبط -> `navigate('/quotations')`

## Where We Use This Pattern

- `src/pages/Quotations/Quotations.tsx`
- `src/pages/Revenue/Revenue.tsx`
- `src/pages/Expenses/Expenses.tsx`
- `src/pages/WorkOrders/WorkOrders.tsx`
- `src/pages/ReceiptVouchers/ReceiptVouchers.tsx`
- `src/pages/PaymentVouchers/PaymentVouchers.tsx`

## When To Use `onAddClick`

Use it when options are dynamic and managed in another screen (customers, suppliers, partners, settings data, etc.).

Do not use it for fixed enums مثل:

- حالة السجل
- نوع التقرير
- طرق دفع ثابتة

## UX Notes

- هذه الفكرة مناسبة جدًا للفورمات الطويلة لأنها تمنع فقدان السياق.
- يفضل دائمًا وجود خيار افتراضي مثل `اختر ...` قبل البيانات الديناميكية.
- لو الصفحة الهدف فيها Tabs، الأفضل فتح التبويب المناسب مباشرة مستقبلًا.
