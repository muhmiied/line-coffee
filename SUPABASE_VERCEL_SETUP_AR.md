# Supabase + Vercel Setup (Arabic)

الملف ده معمول عشان تشغل المشروع بدون أخطاء `Not Found` أو مشاكل `auth/callback`.

## 1) تجهيز متغيرات البيئة محليًا

1. انسخ `.env.example` إلى `.env.local`
2. حط القيم:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 2) تجهيز Supabase

من Supabase Dashboard:

1. افتح `Project Settings` ثم `API`
2. انسخ:
   - `Project URL`
   - `anon public key`

## 3) إعداد Auth URLs في Supabase

من `Authentication` ثم `URL Configuration`:

- `Site URL` = رابط Vercel (مثال: `https://your-project.vercel.app`)
- `Redirect URLs` أضف:
  - `http://localhost:3000/auth/callback`
  - `https://your-project.vercel.app/auth/callback`

## 4) إنشاء الجداول والبيانات

افتح `SQL Editor` وشغّل الملفات بالترتيب ده:

1. `scripts/001_create_tables.sql`
2. `scripts/002_enable_rls.sql`
3. `scripts/003_create_triggers.sql`
4. `scripts/004_seed_data.sql`

مهم: فيه مجموعة SQL قديمة إضافية (`001_categories.sql` لحد `007_seed_data.sql`).  
ما تشغلش المجموعتين مع بعض في نفس الداتابيز الجديدة لتفادي تداخل السياسات.

## 5) إضافة Environment Variables في Vercel

من `Vercel -> Project -> Settings -> Environment Variables`:

- `NEXT_PUBLIC_SUPABASE_URL` = من Supabase API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = من Supabase API
- `NEXT_PUBLIC_SITE_URL` = رابط الموقع على Vercel

بعد الحفظ: اعمل `Redeploy`.

## 6) اختبار سريع بعد الديبلوي

- افتح `/products` وتأكد المنتجات ظهرت
- افتح `/products/{slug}` وتأكد التفاصيل شغالة
- جرّب signup/login وتأكد `auth/callback` بيرجعك للموقع

