# Database Setup - Quotations Table

## نظرة عامة
هذا الملف يحتوي على SQL لإنشاء جدول `quotations` في قاعدة البيانات.

## كيفية التنفيذ

### الطريقة 1: باستخدام Supabase Dashboard
1. افتح مشروعك في [Supabase Dashboard](https://app.supabase.com)
2. اذهب إلى **SQL Editor**
3. انسخ محتوى ملف `quotations.sql`
4. الصق المحتوى في المحرر
5. اضغط على **Run** لتنفيذ الأوامر

### الطريقة 2: باستخدام psql
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f database/quotations.sql
```

### الطريقة 3: باستخدام Supabase CLI
```bash
supabase db push
```

## هيكل الجدول

### الحقول الرئيسية:
- `id`: المعرف الفريد (Primary Key)
- `quotation_number`: رقم عرض السعر (فريد)
- `date`: تاريخ إصدار العرض
- `client_name`: اسم العميل
- `customer_id`: معرف العميل (Foreign Key)
- `total_amount`: المبلغ الإجمالي
- `status`: حالة العرض (مسودة، مرسل، مقبول، مرفوض)
- `valid_until`: تاريخ انتهاء صلاحية العرض
- `items_count`: عدد الأصناف
- `notes`: ملاحظات
- `created_at`: تاريخ الإنشاء
- `updated_at`: تاريخ آخر تحديث

## البيانات التجريبية
الملف يحتوي على 4 سجلات تجريبية. يمكنك حذف السطور من 39-46 إذا كنت لا تريد البيانات التجريبية.

## ملاحظات
- الجدول يحتوي على فهارس لتحسين الأداء
- يوجد trigger لتحديث `updated_at` تلقائياً
- حقل `status` محدد بقيم معينة فقط
- `customer_id` مرتبط بجدول `customers` (اختياري)
