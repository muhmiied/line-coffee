// Database types for Line Coffee

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

export interface Product {
  id: string
  slug: string
  name_en: string
  name_ar: string
  description_en: string | null
  description_ar: string | null
  category_id: string | null
  images: string[]
  origin: string | null
  roast_level: 'light' | 'medium' | 'dark' | 'espresso' | null
  flavor_notes: string[] | null
  is_featured: boolean
  is_best_seller: boolean
  is_new: boolean
  is_visible: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
  // Joined data
  category?: Category
  sizes?: ProductSize[]
}

export interface ProductSize {
  id: string
  product_id: string
  size: '250g' | '500g' | '1kg'
  price: number
  compare_at_price: number | null
  sku: string | null
  is_available: boolean
}

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  preferred_language: 'en' | 'ar'
  created_at: string
  updated_at: string
}

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

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_cost: number
  tax: number
  discount: number
  total: number
  currency: string
  shipping_address: Address | null
  billing_address: Address | null
  payment_method: string | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  notes: string | null
  created_at: string
  updated_at: string
  // Joined data
  items?: OrderItem[]
}

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
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  size: string
  quantity: number
  created_at: string
  updated_at: string
  // Joined data
  product?: Product
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  // Joined data
  product?: Product
}

export interface Testimonial {
  id: string
  customer_name: string
  customer_avatar: string | null
  content_en: string
  content_ar: string
  rating: number
  is_featured: boolean
  is_visible: boolean
  created_at: string
}

// Cart store types (for Zustand)
export interface LocalCartItem {
  productId: string
  size: '250g' | '500g' | '1kg'
  quantity: number
  product?: Product
  price?: number
}

export interface CartStore {
  items: LocalCartItem[]
  isOpen: boolean
  addItem: (item: Omit<LocalCartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

// Language context
export type Language = 'en' | 'ar'

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (en: string, ar: string) => string
  dir: 'ltr' | 'rtl'
}
