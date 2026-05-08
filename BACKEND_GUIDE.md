# Line Coffee - Backend Guide
# دليل الباك إند لمشروع لاين كوفي

## مرحباً! 👋

هذا الدليل يشرح بنية الباك إند في المشروع بطريقة سهلة ومبسطة.

---

## 📁 هيكل المشروع

```
line-coffee/
├── app/
│   ├── api/                    # 🔌 API Routes (الباك إند)
│   │   ├── products/           # API المنتجات
│   │   ├── categories/         # API التصنيفات
│   │   ├── cart/              # API السلة
│   │   ├── orders/            # API الطلبات
│   │   ├── wishlist/          # API المفضلة
│   │   └── testimonials/      # API الشهادات
│   └── auth/                   # صفحات المصادقة
│       ├── login/
│       ├── sign-up/
│       └── callback/
│
├── lib/
│   ├── services/              # 🔧 Business Logic (منطق العمل)
│   │   ├── products.service.ts
│   │   ├── categories.service.ts
│   │   ├── cart.service.ts
│   │   ├── orders.service.ts
│   │   ├── wishlist.service.ts
│   │   └── testimonials.service.ts
│   │
│   ├── actions/               # ⚡ Server Actions
│   │   └── auth.actions.ts
│   │
│   ├── hooks/                 # 🪝 React Hooks (للفرونت)
│   │   ├── use-products.ts
│   │   ├── use-cart.ts
│   │   └── use-wishlist.ts
│   │
│   ├── types/                 # 📝 TypeScript Types
│   │   └── database.ts
│   │
│   └── supabase/              # 🗄️ Database Connection
│       ├── client.ts          # للـ Client Components
│       ├── server.ts          # للـ Server Components
│       └── middleware.ts      # للـ Middleware
│
├── scripts/                   # 📜 SQL Scripts
│   ├── 001_create_tables.sql
│   ├── 002_enable_rls.sql
│   ├── 003_create_triggers.sql
│   └── 004_seed_data.sql
│
└── middleware.ts              # 🛡️ Auth Middleware
```

---

## 🔄 كيف يعمل الباك إند؟

### الطبقات الثلاث:

```
┌─────────────────┐
│   API Routes    │  ← يستقبل الطلبات من الفرونت
│  /app/api/...   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Services     │  ← يحتوي على منطق العمل
│  /lib/services  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │  ← قاعدة البيانات
│   (Database)    │
└─────────────────┘
```

### مثال عملي - جلب المنتجات:

1. **الفرونت** يستدعي: `GET /api/products?category=whole-beans`
2. **API Route** (`app/api/products/route.ts`) يستقبل الطلب
3. **Service** (`lib/services/products.service.ts`) يجلب البيانات من Supabase
4. **API Route** يرجع البيانات للفرونت

---

## 📚 شرح الملفات المهمة

### 1. Types (`lib/types/database.ts`)
يحتوي على تعريفات الأنواع (Types) لكل جدول في قاعدة البيانات.

```typescript
// مثال: نوع المنتج
interface Product {
  id: string
  name_en: string
  name_ar: string
  price: number
  // ...
}
```

### 2. Services (`lib/services/`)
كل service يتعامل مع جدول معين في قاعدة البيانات.

```typescript
// مثال: جلب المنتجات
export async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*')
  return data
}
```

### 3. API Routes (`app/api/`)
تستقبل طلبات HTTP وترجع JSON.

```typescript
// مثال: GET /api/products
export async function GET(request: NextRequest) {
  const products = await getProducts()
  return NextResponse.json({ success: true, data: products })
}
```

### 4. Hooks (`lib/hooks/`)
تسهل استخدام الـ API في الفرونت.

```typescript
// مثال: استخدام hook المنتجات
const { products, isLoading } = useProducts({ category: 'whole-beans' })
```

---

## 🗄️ قاعدة البيانات (Supabase)

### الجداول:

| الجدول | الوصف |
|--------|-------|
| `profiles` | بيانات المستخدمين |
| `categories` | تصنيفات المنتجات |
| `products` | المنتجات |
| `product_sizes` | أحجام وأسعار المنتجات |
| `cart_items` | عناصر السلة |
| `wishlist_items` | المفضلة |
| `orders` | الطلبات |
| `order_items` | عناصر الطلبات |
| `addresses` | عناوين الشحن |
| `testimonials` | شهادات العملاء |

### Row Level Security (RLS):
كل مستخدم يرى بياناته فقط (السلة، الطلبات، العناوين).

---

## 🔐 المصادقة (Authentication)

### الملفات:
- `lib/actions/auth.actions.ts` - إجراءات المصادقة
- `app/auth/login/page.tsx` - صفحة تسجيل الدخول
- `app/auth/sign-up/page.tsx` - صفحة التسجيل
- `middleware.ts` - حماية الصفحات

### الدوال المتاحة:
```typescript
import { signIn, signUp, signOut, getCurrentUser } from '@/lib/actions'

// تسجيل الدخول
await signIn({ email, password })

// تسجيل جديد
await signUp({ email, password, firstName, lastName })

// تسجيل الخروج
await signOut()

// جلب المستخدم الحالي
const user = await getCurrentUser()
```

---

## 🛒 الـ API Endpoints

### Products
```
GET  /api/products              # جلب كل المنتجات
GET  /api/products?category=x   # فلترة بالتصنيف
GET  /api/products?featured=true # المنتجات المميزة
GET  /api/products/[slug]       # منتج واحد
```

### Categories
```
GET  /api/categories            # كل التصنيفات
GET  /api/categories?withCount=true # مع عدد المنتجات
```

### Cart (تحتاج تسجيل دخول)
```
GET    /api/cart                # جلب السلة
POST   /api/cart                # إضافة للسلة
PATCH  /api/cart/[itemId]       # تحديث الكمية
DELETE /api/cart/[itemId]       # حذف عنصر
DELETE /api/cart                # تفريغ السلة
```

### Orders (تحتاج تسجيل دخول)
```
GET   /api/orders               # جلب الطلبات
POST  /api/orders               # إنشاء طلب
GET   /api/orders/[orderId]     # تفاصيل طلب
PATCH /api/orders/[orderId]     # إلغاء طلب
```

### Wishlist (تحتاج تسجيل دخول)
```
GET  /api/wishlist              # جلب المفضلة
POST /api/wishlist              # إضافة/حذف (toggle)
```

---

## 💡 نصائح للتطوير

### 1. إضافة endpoint جديد:
```
1. أنشئ ملف في app/api/[endpoint]/route.ts
2. استخدم services الموجودة أو أنشئ service جديد
3. ارجع NextResponse.json()
```

### 2. إضافة جدول جديد:
```
1. أضف SQL في scripts/
2. أضف Type في lib/types/database.ts
3. أنشئ service في lib/services/
4. أنشئ API route في app/api/
```

### 3. استخدام الـ Hooks في الفرونت:
```typescript
import { useProducts, useCart } from '@/lib/hooks'

function MyComponent() {
  const { products, isLoading } = useProducts()
  const { addToCart } = useCart()
  
  // استخدم البيانات...
}
```

---

## 🐛 Debugging

### طباعة logs:
```typescript
console.log('[v0] Products:', products)
```

### التحقق من الأخطاء:
```typescript
try {
  const result = await someFunction()
} catch (error) {
  console.error('Error:', error)
}
```

---

## ❓ أسئلة شائعة

**س: كيف أضيف حقل جديد للمنتج؟**
1. أضف العمود في Supabase
2. حدث Type في `lib/types/database.ts`
3. حدث Service إذا لزم

**س: كيف أحمي endpoint معين؟**
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**س: كيف أختبر الـ API؟**
استخدم المتصفح أو Postman:
```
http://localhost:3000/api/products
```

---

بالتوفيق! 🚀
