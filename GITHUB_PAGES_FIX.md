# 🔧 حل مشكلة Refresh في GitHub Pages

## المشكلة
عند عمل refresh للصفحة في مسار مثل `/customers/C00001` على GitHub Pages، يظهر خطأ 404 أو رسالة:
```
The server is configured with a public base URL of /share_in_dashbord/ - 
did you mean to visit /share_in_dashbord/customers/C00001 instead?
```

## السبب
GitHub Pages لا يدعم client-side routing بشكل افتراضي. عندما تقوم بعمل refresh، GitHub Pages يحاول البحث عن ملف فعلي في المسار `/customers/C00001` ولا يجده.

## الحل المطبق

### 1️⃣ تحديث `vite.config.ts`
جعلنا `base` ديناميكي:
- في التطوير المحلي: `base: '/'`
- في الإنتاج (GitHub Pages): `base: '/share_in_dashbord/'`

```typescript
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/share_in_dashbord/',
}))
```

### 2️⃣ إضافة `404.html`
ملف `public/404.html` يعيد توجيه جميع الطلبات إلى `index.html` مع الحفاظ على المسار.

### 3️⃣ تحديث `index.html`
إضافة سكريبت يستعيد المسار الصحيح بعد إعادة التوجيه من `404.html`.

## كيف يعمل الحل؟

1. المستخدم يزور `/share_in_dashbord/customers/C00001`
2. عند عمل refresh، GitHub Pages لا يجد الملف
3. GitHub Pages يعرض `404.html`
4. `404.html` يحفظ المسار في `sessionStorage` ويعيد التوجيه إلى `index.html`
5. `index.html` يقرأ المسار من `sessionStorage` ويستخدم `history.replaceState` لاستعادته
6. React Router يعرض الصفحة الصحيحة

## الاختبار

### في التطوير المحلي:
```bash
npm run dev
# افتح http://localhost:5173/customers/C00001
# اعمل refresh - يجب أن يعمل بدون مشاكل
```

### في الإنتاج (GitHub Pages):
```bash
npm run build
npm run preview
# افتح http://localhost:4173/share_in_dashbord/customers/C00001
# اعمل refresh - يجب أن يعمل بدون مشاكل
```

## النشر على GitHub Pages

1. **Build المشروع**:
```bash
npm run build
```

2. **رفع الملفات**:
```bash
git add .
git commit -m "Fix GitHub Pages routing"
git push
```

3. **تفعيل GitHub Pages**:
   - اذهب إلى Settings → Pages
   - اختر Branch: `main` أو `gh-pages`
   - اختر Folder: `/` أو `/docs` (حسب إعداداتك)
   - احفظ

## ملاحظات مهمة

### ✅ الآن يعمل:
- ✅ Refresh في أي صفحة
- ✅ الروابط المباشرة
- ✅ الزر Back/Forward في المتصفح
- ✅ المشاركة عبر الروابط

### ⚠️ تنبيهات:
- تأكد من أن `base` في `vite.config.ts` يطابق اسم repository في GitHub
- إذا غيرت اسم repository، حدث `base` في `vite.config.ts`
- الملفات في `public/` يتم نسخها مباشرة إلى `dist/` عند البناء

## بدائل أخرى

إذا كنت تستخدم خدمة استضافة أخرى:

### Netlify:
أنشئ ملف `public/_redirects`:
```
/*    /index.html   200
```

### Vercel:
أنشئ ملف `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Apache:
أنشئ ملف `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## المراجع
- [React Router - GitHub Pages](https://github.com/rafgraph/spa-github-pages)
- [Vite - GitHub Pages Deployment](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [Create React App - GitHub Pages](https://create-react-app.dev/docs/deployment/#github-pages)
