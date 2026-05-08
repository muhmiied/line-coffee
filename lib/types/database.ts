/**
 * ===========================================
 * DATABASE TYPES - أنواع قاعدة البيانات
 * ===========================================
 * 
 * هذا الملف يحتوي على جميع الأنواع (Types) المستخدمة في المشروع
 * كل نوع يمثل جدول في قاعدة البيانات Supabase
 * 
 * للمبتدئين: الـ Types تساعد TypeScript على فهم شكل البيانات
 * وتعطيك autocomplete وتحذيرات إذا استخدمت البيانات بشكل خاطئ
 */

// ==========================================
// USER & PROFILE - المستخدم والملف الشخصي
// ==========================================

export interface Profile {
  id: string                          // معرف المستخدم (UUID)
  first_name: string | null           // الاسم الأول
  last_name: string | null            // الاسم الأخير
  phone: string | null                // رقم الهاتف
  avatar_url: string | null           // صورة المستخدم
  preferred_language: 'en' | 'ar'     // اللغة المفضلة
  created_at: string                  // تاريخ الإنشاء
  updated_at: string                  // تاريخ التحديث
}

// ==========================================
// CATEGORY - التصنيف
// ==========================================

export interface Category {
  id: string
  slug: string                        // الرابط المختصر (مثل: whole-beans)
  name_en: string                     // الاسم بالإنجليزية
  name_ar: string                     // الاسم بالعربية
  description_en: string | null       // الوصف بالإنجليزية
  description_ar: string | null       // الوصف بالعربية
  image_url: string | null            // صورة التصنيف
  sort_order: number                  // ترتيب العرض
  is_visible: boolean                 // هل التصنيف ظاهر؟
  created_at: string
  updated_at: string
}

// ==========================================
// PRODUCT - المنتج
// ==========================================

export interface Product {
  id: string
  slug: string                        // الرابط المختصر
  name_en: string                     // الاسم بالإنجليزية
  name_ar: string                     // الاسم بالعربية
  description_en: string | null       // الوصف بالإنجليزية
  description_ar: string | null       // الوصف بالعربية
  category_id: string | null          // معرف التصنيف
  images: string[]                    // صور المنتج (مصفوفة)
  origin: string | null               // بلد المنشأ
  roast_level: 'light' | 'medium' | 'dark' | 'espresso' | null  // درجة التحميص
  flavor_notes: string[]              // نكهات المنتج
  is_featured: boolean                // هل المنتج مميز؟
  is_best_seller: boolean             // هل المنتج من الأكثر مبيعاً؟
  is_new: boolean                     // هل المنتج جديد؟
  is_visible: boolean                 // هل المنتج ظاهر؟
  stock_quantity: number              // الكمية المتوفرة
  created_at: string
  updated_at: string
}

// المنتج مع التصنيف والأحجام (للعرض الكامل)
export interface ProductWithDetails extends Product {
  category: Category | null           // بيانات التصنيف
  sizes: ProductSize[]                // أحجام المنتج وأسعاره
}

// ==========================================
// PRODUCT SIZE - حجم المنتج وسعره
// ==========================================

export interface ProductSize {
  id: string
  product_id: string                  // معرف المنتج
  size: '250g' | '500g' | '1kg'       // الحجم
  price: number                       // السعر
  compare_at_price: number | null     // السعر قبل الخصم
  sku: string | null                  // رمز المنتج
  is_available: boolean               // هل متوفر؟
  created_at: string
}

// ==========================================
// ADDRESS - العنوان
// ==========================================

export interface Address {
  id: string
  user_id: string                     // معرف المستخدم
  label: string                       // اسم العنوان (مثل: المنزل، العمل)
  street_address: string              // عنوان الشارع
  city: string                        // المدينة
  state: string | null                // المنطقة
  postal_code: string | null          // الرمز البريدي
  country: string                     // الدولة
  is_default: boolean                 // هل هو العنوان الافتراضي؟
  created_at: string
  updated_at: string
}

// ==========================================
// ORDER - الطلب
// ==========================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string
  order_number: string                // رقم الطلب (مثل: LC-20240101-1234)
  user_id: string | null              // معرف المستخدم
  status: OrderStatus                 // حالة الطلب
  subtotal: number                    // المجموع الفرعي
  shipping_cost: number               // تكلفة الشحن
  tax: number                         // الضريبة
  discount: number                    // الخصم
  total: number                       // المجموع الكلي
  currency: string                    // العملة (SAR)
  shipping_address: Address | null    // عنوان الشحن
  billing_address: Address | null     // عنوان الفوترة
  payment_method: string | null       // طريقة الدفع
  payment_status: PaymentStatus       // حالة الدفع
  notes: string | null                // ملاحظات
  created_at: string
  updated_at: string
}

// الطلب مع المنتجات
export interface OrderWithItems extends Order {
  items: OrderItem[]                  // منتجات الطلب
}

// ==========================================
// ORDER ITEM - عنصر الطلب
// ==========================================

export interface OrderItem {
  id: string
  order_id: string                    // معرف الطلب
  product_id: string | null           // معرف المنتج
  product_name: string                // اسم المنتج (محفوظ)
  product_image: string | null        // صورة المنتج
  size: string | null                 // الحجم
  quantity: number                    // الكمية
  unit_price: number                  // سعر الوحدة
  total_price: number                 // السعر الإجمالي
  created_at: string
}

// ==========================================
// CART ITEM - عنصر السلة
// ==========================================

export interface CartItem {
  id: string
  user_id: string                     // معرف المستخدم
  product_id: string                  // معرف المنتج
  size: string                        // الحجم
  quantity: number                    // الكمية
  created_at: string
  updated_at: string
}

// عنصر السلة مع بيانات المنتج (للعرض)
export interface CartItemWithProduct extends CartItem {
  product: Product                    // بيانات المنتج
  product_size: ProductSize           // بيانات الحجم والسعر
}

// ==========================================
// WISHLIST ITEM - عنصر المفضلة
// ==========================================

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

// عنصر المفضلة مع بيانات المنتج
export interface WishlistItemWithProduct extends WishlistItem {
  product: ProductWithDetails
}

// ==========================================
// TESTIMONIAL - شهادة العميل
// ==========================================

export interface Testimonial {
  id: string
  customer_name: string               // اسم العميل
  customer_avatar: string | null      // صورة العميل
  content_en: string                  // المحتوى بالإنجليزية
  content_ar: string                  // المحتوى بالعربية
  rating: number                      // التقييم (1-5)
  is_featured: boolean                // هل مميز؟
  is_visible: boolean                 // هل ظاهر؟
  created_at: string
}

// ==========================================
// API RESPONSE TYPES - أنواع استجابة API
// ==========================================

// استجابة نجاح
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// استجابة خطأ
export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
}

// استجابة API عامة
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// استجابة مع pagination
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
