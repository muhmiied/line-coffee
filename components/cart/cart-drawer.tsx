'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const { t, language, dir } = useLanguage()
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, getTotal } = useCartStore()

  const subtotal = getTotal()
  const shipping = subtotal >= 200 ? 0 : 25
  const total = subtotal + shipping

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Drawer */}
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
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold">
                  {t('Your Cart', 'سلتك')}
                </h2>
                {items.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({items.length} {t('items', 'عناصر')})
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium text-lg mb-2">
                    {t('Your cart is empty', 'سلتك فارغة')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      'Discover our premium coffee collection',
                      'اكتشف مجموعتنا المميزة من القهوة'
                    )}
                  </p>
                  <Button onClick={closeCart} asChild>
                    <Link href="/products">{t('Browse Products', 'تصفح المنتجات')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: dir === 'rtl' ? -100 : 100 }}
                      className="flex gap-3 p-3 bg-secondary/50 rounded-lg sm:gap-4"
                    >
                      {/* Product Image */}
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0 sm:h-20 sm:w-20">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={language === 'ar' ? item.name_ar : item.name_en}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {language === 'ar' ? item.name_ar : item.name_en}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">{item.size}</p>

                        <div className="flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-semibold text-sm">
                              {item.price * item.quantity} {t('EGP', 'ج.م')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}

                  {/* Clear Cart */}
                  {items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="w-full text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('Clear Cart', 'مسح السلة')}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-4">
                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('Subtotal', 'المجموع الفرعي')}</span>
                    <span>{subtotal} {t('EGP', 'ج.م')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('Shipping', 'الشحن')}</span>
                    <span>
                      {shipping === 0 ? t('Free', 'مجاني') : `${shipping} ${t('EGP', 'ج.م')}`}
                    </span>
                  </div>
                  {subtotal < 200 && (
                    <p className="text-xs text-muted-foreground">
                      {t(
                        `Add ${200 - subtotal} EGP more for free shipping`,
                        `أضف ${200 - subtotal} ج.م للشحن المجاني`
                      )}
                    </p>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                    <span>{t('Total', 'الإجمالي')}</span>
                    <span>{total} {t('EGP', 'ج.م')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button asChild className="w-full" size="lg" onClick={closeCart}>
                    <Link href="/checkout">{t('Checkout', 'إتمام الطلب')}</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={closeCart}
                    asChild
                  >
                    <Link href="/products">{t('Continue Shopping', 'متابعة التسوق')}</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
