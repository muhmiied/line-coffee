// ==========================================
// USER & PROFILE
// ==========================================

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  preferred_language: 'en' | 'ar'
  address: string | null
  city: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// CATEGORY
// ==========================================

export interface Category {
  id: string
  slug: string
  name_en: string
  name_ar: string
  description_en: string | null
  description_ar: string | null
  image_url: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

// ==========================================
// PRODUCT
// ==========================================

export interface Product {
  id: string
  slug: string
  name_en: string
  name_ar: string
  description_en: string | null
  description_ar: string | null
  short_description_en: string | null
  short_description_ar: string | null
  category_id: string | null
  images: string[]
  origin: string | null
  roast_level: 'light' | 'medium' | 'dark' | 'espresso' | null
  flavor_notes: string[]
  is_featured: boolean
  is_best_seller: boolean
  is_new: boolean
  is_visible: boolean
  stock_quantity: number
  low_stock_threshold: number
  created_at: string
  updated_at: string
}

export interface ProductWithDetails extends Product {
  category: Category | null
  sizes: ProductSize[]
}

// ==========================================
// PRODUCT SIZE
// ==========================================

export interface ProductSize {
  id: string
  product_id: string
  size: '250g' | '500g' | '1kg'
  price: number
  compare_at_price: number | null
  sku: string | null
  is_available: boolean
  created_at: string
}

// ==========================================
// ADDRESS
// ==========================================

export interface Address {
  id: string
  user_id: string
  label: string
  street_address: string
  city: string
  state: string | null
  postal_code: string | null
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// ==========================================
// ORDER
// ==========================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'cod' | 'electronic_wallet' | 'instapay'

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  // Denormalised customer snapshot (saved at order time)
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  address: string | null
  // Financials
  subtotal: number
  shipping_cost: number
  tax: number
  discount_code: string | null
  discount_amount: number
  discount: number
  total: number
  currency: string
  // Addresses (JSON snapshot)
  shipping_address: Record<string, unknown> | null
  billing_address: Record<string, unknown> | null
  // Items snapshot stored directly on the order row
  items: OrderItemSnapshot[] | null
  // Payment
  payment_method: PaymentMethod | string | null
  payment_status: PaymentStatus
  // Misc
  status: OrderStatus
  cancelled_at?: string | null
  cancellation_initiated_by?: 'customer' | 'admin' | null
  cancellation_reason?: string | null
  stock_restored_at?: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItemSnapshot {
  product_id: string
  product_name: string
  product_image?: string
  size?: string
  quantity: number
  unit_price: number
  total_price: number
  customizations?: Record<string, unknown>
}

export interface OrderWithItems extends Order {
  items_detail: OrderItem[]
}

// ==========================================
// ORDER ITEM
// ==========================================

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  size: string | null
  quantity: number
  unit_price: number
  total_price: number
  customizations: Record<string, unknown> | null
  created_at: string
}

// ==========================================
// CART ITEM
// ==========================================

export interface CartItem {
  id: string
  user_id: string
  product_id: string | null
  client_item_id: string | null
  name_en: string | null
  name_ar: string | null
  image: string | null
  unit_price: number | null
  customizations: Record<string, unknown> | null
  size: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface CartItemWithProduct extends CartItem {
  product: Product | null
  product_size: ProductSize | null
}

// ==========================================
// WISHLIST ITEM
// ==========================================

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: ProductWithDetails
}

// ==========================================
// TESTIMONIAL
// ==========================================

export interface Testimonial {
  id: string
  customer_name: string
  customer_avatar: string | null
  content_en: string
  content_ar: string | null
  rating: number
  is_featured: boolean
  is_visible: boolean
  is_approved: boolean
  created_at: string
  updated_at?: string | null
}

// ==========================================
// COFFEE BEAN
// ==========================================

export interface CoffeeBean {
  id: string
  name_en: string
  name_ar: string
  origin: string | null
  family?: 'arabica' | 'robusta' | 'other'
  price?: number
  description_en: string | null
  description_ar: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// ==========================================
// FLAVOR BASE & OPTIONS
// ==========================================

export interface FlavorBase {
  id: string
  name_en: string
  name_ar: string
  price?: number
  type?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  options?: FlavorOption[]
}

export interface FlavorOption {
  id: string
  base_id: string
  name_en: string
  name_ar: string
  price_delta?: number
  option_type?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

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
