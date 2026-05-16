'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

export function WishlistDrawer() {
  const { t, language, dir } = useLanguage()
  const { items, isOpen, closeWishlist, removeItem } = useWishlistStore()
  const { addItem: addToCart, openCart } = useCartStore()

  const handleAddToCart = (item: (typeof items)[0]) => {
    addToCart({
      id: `${item.productId}-250g`,
      product_id: item.productId,
      name_en: item.name_en,
      name_ar: item.name_ar,
      size: '250g' as const,
      price: item.price,
      quantity: 1,
      image: item.image,
    })
    removeItem(item.productId)
    closeWishlist()
    openCart()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: dir === 'rtl' ? -400 : 400 }}
            animate={{ x: 0 }}
            exit={{ x: dir === 'rtl' ? -400 : 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 bottom-0 z-50 w-full max-w-[min(28rem,100vw)] bg-card shadow-xl flex flex-col',
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

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium text-lg mb-2">
                    {t('Your wishlist is empty', 'قائمة المفضلة فارغة')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('Save your favorite products here', 'احفظ منتجاتك المفضلة هنا')}
                  </p>
                  <Button onClick={closeWishlist} asChild>
                    <Link href="/products">{t('Browse Products', 'تصفح المنتجات')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: dir === 'rtl' ? -100 : 100 }}
                      className="flex gap-3 p-3 bg-secondary/50 rounded-lg sm:gap-4"
                    >
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeWishlist}
                        className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0 sm:h-20 sm:w-20"
                      >
                        {item.image ? (
                          <Image src={item.image} alt={language === 'ar' ? item.name_ar : item.name_en} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Heart className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`} onClick={closeWishlist}>
                          <h4 className="font-medium text-sm truncate hover:text-primary transition-colors">
                            {language === 'ar' ? item.name_ar : item.name_en}
                          </h4>
                        </Link>
                        <p className="text-sm text-primary font-semibold mt-1">
                          {item.price} {t('EGP', 'ج.م')}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" onClick={() => handleAddToCart(item)} className="h-auto min-h-8 px-2 py-1.5 text-xs">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            {t('Add to Cart', 'أضف للسلة')}
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <Button variant="outline" className="w-full" onClick={closeWishlist} asChild>
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
