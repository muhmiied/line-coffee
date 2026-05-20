/**
 * ===========================================
 * SERVICES INDEX - فهرس الخدمات
 * ===========================================
 * 
 * هذا الملف يجمع جميع الخدمات في مكان واحد
 * يمكنك استيراد أي خدمة من هنا مباشرة
 * 
 * مثال:
 * import { getProducts, getCategories } from '@/lib/services'
 */

// Products - المنتجات
export {
  getProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  getRelatedProducts,
  countProducts
} from './products.service'

// Categories - التصنيفات
export {
  getCategories,
  getCategoryBySlug,
  getCategoriesWithCount
} from './categories.service'

// Cart - السلة
export {
  getCartItems,
  getStoreCartItems,
  addToCart,
  mergeCartItems,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartTotal
} from './cart.service'

// Orders - الطلبات
export {
  getUserOrders,
  getOrderById,
  getOrderByNumber,
  createOrder,
  cancelOrder,
  restoreOrderStock
} from './orders.service'

// Wishlist - المفضلة
export {
  getWishlist,
  getStoreWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  toggleWishlist,
  mergeWishlistItems,
  getWishlistCount
} from './wishlist.service'

// Testimonials - شهادات العملاء
export {
  getTestimonials,
  getFeaturedTestimonials
} from './testimonials.service'
