# دليل استخدام Prisma مع Supabase

هذا الدليل يشرح كيفية التعامل مع Prisma ORM في مشروعك، بدءاً من الاستخدام الأساسي وصولاً إلى إدارة تغييرات قاعدة البيانات (Migrations).

## 1. الإعداد الأولي (تذكير)

تأكد من أن ملف `.env` يحتوي على رابط الاتصال الصحيح بقاعدة بيانات Supabase:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
```

## 2. كيفية استخدام Prisma في الكود (CRUD)

لاستخدام Prisma، تحتاج أولاً إلى استيراد `PrismaClient` وإنشاء نسخة منه.

### مثال في ملف `server/server.js`:

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ... باقي كود السيرفر
```

### أمثلة على العمليات الأساسية:

#### **جلب البيانات (Read)**
```javascript
// جلب كل المستخدمين
const allUsers = await prisma.user.findMany();

// جلب مستخدم واحد بشرط معين
const user = await prisma.user.findUnique({
  where: {
    email: 'khaled@example.com',
  },
});
```

#### **إضافة بيانات (Create)**
```javascript
const newUser = await prisma.user.create({
  data: {
    name: 'Khaled',
    email: 'khaled@example.com',
    role: 'ADMIN',
  },
});
```

#### **تحديث بيانات (Update)**
```javascript
const updatedUser = await prisma.user.update({
  where: {
    id: 1,
  },
  data: {
    name: 'Khaled Updated',
  },
});
```

#### **حذف بيانات (Delete)**
```javascript
const deletedUser = await prisma.user.delete({
  where: {
    id: 1,
  },
});
```

---

## 3. إدارة التغييرات (Migrations)

الـ **Migrations** هي طريقة لتتبع التغييرات التي تجريها على هيكل قاعدة البيانات (Schema) وتطبيقها بشكل آمن.

### السيناريو: تريد إضافة جدول جديد أو تعديل عمود

1.  **تعديل ملف `prisma/schema.prisma`**:
    قم بإضافة الموديل (الجدول) الجديد أو التعديل المطلوب.

    ```prisma
    // مثال: إضافة جدول للمقالات
    model Post {
      id        Int      @id @default(autoincrement())
      title     String
      content   String?
      published Boolean  @default(false)
      authorId  Int
      author    User     @relation(fields: [authorId], references: [id])
    }
    ```

2.  **إنشاء وتشغيل المايجريشن**:
    بعد التعديل، نفذ الأمر التالي في التيرمينال. هذا الأمر سيقوم بإنشاء ملف SQL بالتغييرات وتطبيقها على قاعدة البيانات في Supabase.

    ```bash
    npx prisma migrate dev --name add_post_model
    ```
    *   `--name`: اسم وصفي للتغيير (مثل `add_post_model` أو `add_phone_to_user`).

3.  **تحديث العميل (Prisma Client)**:
    عادةً ما يقوم الأمر السابق بتحديث العميل تلقائياً، ولكن إذا واجهت مشاكل في التعرف على الجداول الجديدة في الكود، شغل:

    ```bash
    npx prisma generate
    ```

### متى تستخدم `db pull` مقابل `migrate dev`؟

*   **استخدم `npx prisma migrate dev` (الوضع المفضل)**: عندما تكون أنت من يبني قاعدة البيانات من الصفر أو تريد التحكم الكامل في التغييرات من خلال ملف `schema.prisma`. هذا هو النهج الموصى به للتطوير.
*   **استخدم `npx prisma db pull`**: إذا قمت بإنشاء جداول يدوياً من لوحة تحكم Supabase وتريد تحديث ملف `schema.prisma` ليعكس هذه التغييرات. **تحذير**: هذا لا ينشئ ملفات migration وقد يسبب تعارضاً إذا كنت تخلط بين الطريقتين.

---

## 4. أوامر مفيدة (Cheat Sheet)

| الأمر | الوصف |
| :--- | :--- |
| `npx prisma migrate dev` | تطبيق التغييرات من `schema.prisma` إلى قاعدة البيانات وإنشاء ملف migration. |
| `npx prisma generate` | تحديث مكتبة `PrismaClient` لتعرف التغييرات الجديدة وتوفر الـ Auto-completion. |
| `npx prisma studio` | فتح لوحة تحكم بصرية في المتصفح لعرض وتعديل البيانات في قاعدة البيانات بسهولة. |
| `npx prisma db pull` | جلب هيكل قاعدة البيانات الحالي من Supabase وتحديث ملف `schema.prisma`. |
| `npx prisma db push` | تطبيق التغييرات بسرعة على قاعدة البيانات دون إنشاء ملفات migration (مفيد للتجربة السريعة فقط). |

---

## ملخص دورة العمل (Workflow)

1.  عدّل ملف `prisma/schema.prisma`.
2.  شغل `npx prisma migrate dev --name <description>`.
3.  استخدم الجداول الجديدة في كودك باستخدام `prisma.yourModel.method()`.
