'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

// Sample products - in production this would come from API
const sampleProducts = [
  {
    id: '1',
    name_en: 'Turkish Coffee Classic',
    name_ar: 'قهوة تركية كلاسيك',
    slug: 'turkish-coffee-classic',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400'],
    price: 75,
  },
  {
    id: '2',
    name_en: 'Espresso Blend',
    name_ar: 'خلطة إسبريسو',
    slug: 'espresso-blend',
    images: ['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400'],
    price: 95,
  },
  {
    id: '3',
    name_en: 'Cappuccino Mix',
    name_ar: 'كابتشينو ميكس',
    slug: 'cappuccino-mix',
    images: ['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400'],
    price: 85,
  },
  {
    id: '4',
    name_en: 'Hazelnut Coffee',
    name_ar: 'قهوة بالبندق',
    slug: 'hazelnut-coffee',
    images: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'],
    price: 90,
  },
]

export function WishlistDrawer() {
  const { t, language, dir } = useLanguage()
  const { items, isOpen, closeWishlist, removeItem } = useWishlistStore()
  const { addItem: addToCart, openCart } = useCartStore()
  const [wishlistProducts, setWishlistProducts] = useState<typeof sampleProducts>([])

  // Get product details for wishlist items
  useEffect(() => {
    if (isOpen) {
      const products = items
        .map((item) => sampleProducts.find((p) => p.id === item.productId))
        .filter(Boolean) as typeof sampleProducts
      setWishlistProducts(products)
    }
  }, [items, isOpen])

  const handleAddToCart = (product: (typeof sampleProducts)[0]) => {
    addToCart({
      id: `${product.id}-250g`,
      product_id: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      size: '250g' as const,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '',
    })
    removeItem(product.id)
    closeWishlist()
    openCart()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: dir === 'rtl' ? -400 : 400 }}
            animate={{ x: 0 }}
            exit={{ x: dir === 'rtl' ? -400 : 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-xl flex flex-col',
              dir === 'rtl' ? 'left-0' : 'right-0'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold">
                  {t('Wishlist', 'المفضلة')}
                </h2>
                {items.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({items.length} {t('items', 'عناصر')})
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={closeWishlist}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {wishlistProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium text-lg mb-2">
                    {t('Your wishlist is empty', 'قائمة المفضلة فارغة')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      'Save your favorite products here',
                      'احفظ منتجاتك المفضلة هنا'
                    )}
                  </p>
                  <Button onClick={closeWishlist} asChild>
                    <Link href="/products">{t('Browse Products', 'تصفح المنتجات')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: dir === 'rtl' ? -100 : 100 }}
                      className="flex gap-4 p-3 bg-secondary/50 rounded-lg"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeWishlist}
                        className="relative h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0"
                      >
                        <Image
                          src={product.images[0]}
                          alt={language === 'ar' ? product.name_ar : product.name_en}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={closeWishlist}
                        >
                          <h4 className="font-medium text-sm truncate hover:text-primary transition-colors">
                            {language === 'ar' ? product.name_ar : product.name_en}
                          </h4>
                        </Link>
                        <p className="text-sm text-primary font-semibold mt-1">
                          {product.price} EGP
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="h-8 text-xs"
                          >
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            {t('Add to Cart', 'أضف للسلة')}
                          </Button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlistProducts.length > 0 && (
              <div className="border-t border-border p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={closeWishlist}
                  asChild
                >
                  <Link href="/products">{t('Continue Shopping', 'متابعة التسوق')}</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
