'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCustomItemMaxQuantity, getCustomStockIssue } from '@/lib/custom-stock'
import { useLanguage } from '@/lib/context/language'
import { calculateShippingCost, getFreeShippingRemaining } from '@/lib/config/shipping'
import { useFreeShippingThreshold } from '@/lib/hooks/use-free-shipping-threshold'
import { useCartStore } from '@/lib/store/cart'
import type { CartItem } from '@/lib/store/cart'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type BlendBeanDetail = {
  nameEn: string
  nameAr: string
  percent: number | null
}

function getEspressoBlendBeans(item: CartItem): BlendBeanDetail[] {
  const customizations = item.customizations
  const type = customizations?.type

  if (!customizations || (type !== 'espresso-blend' && type !== 'blend')) return []
  if (!Array.isArray(customizations.beans)) return []

  return customizations.beans
    .map((bean) => {
      if (!bean || typeof bean !== 'object') return null
      const row = bean as Record<string, unknown>
      const nameEn = typeof row.name_en === 'string' ? row.name_en : ''
      const nameAr = typeof row.name_ar === 'string' ? row.name_ar : nameEn
      const percent = Number(row.percent)

      return {
        nameEn,
        nameAr,
        percent: Number.isFinite(percent) ? percent : null,
      }
    })
    .filter((bean): bean is BlendBeanDetail => Boolean(bean?.nameEn || bean?.nameAr))
}

export function CartDrawer() {
  const { t, language, dir } = useLanguage()
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, getTotal } = useCartStore()
  const freeShippingRule = useFreeShippingThreshold()

  const subtotal = getTotal()
  const shipping = calculateShippingCost(subtotal, freeShippingRule.threshold, undefined, freeShippingRule.active)
  const freeShippingRemaining = getFreeShippingRemaining(
    subtotal,
    freeShippingRule.threshold,
    freeShippingRule.active
  )
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
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-border/30 bg-secondary/40">
                    <ShoppingBag className="h-9 w-9 text-muted-foreground/40" />
                  </div>
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
                  {items.map((item) => {
                    const espressoBlendBeans = getEspressoBlendBeans(item)
                    const maxQuantity = Math.min(
                      item.stock_quantity ?? Infinity,
                      getCustomItemMaxQuantity(items, item),
                    )
                    const canIncrease = item.quantity < maxQuantity
                    const increaseIssue = getCustomStockIssue(items, item, item.quantity + 1)

                    return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: dir === 'rtl' ? -100 : 100 }}
                      className="flex gap-3 p-3 bg-secondary/50 rounded-lg border border-border/40 sm:gap-4"
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
                        {espressoBlendBeans.length > 0 && (
                          <div className="mb-2 rounded-md border border-border/60 bg-background/35 p-2 text-[11px] text-muted-foreground">
                            <p className="mb-1 font-medium text-foreground">
                              {t('Espresso blend', 'توليفة الإسبريسو')}
                            </p>
                            <div className="space-y-1">
                              {espressoBlendBeans.map((bean, index) => (
                                <div key={`${bean.nameEn}-${index}`} className="flex justify-between gap-2">
                                  <span className="truncate">{language === 'ar' ? bean.nameAr : bean.nameEn}</span>
                                  {bean.percent !== null && <span className="shrink-0">{bean.percent}%</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() => {
                                if (!canIncrease || increaseIssue) {
                                  if (!increaseIssue) {
                                    toast.error(t('Not enough stock available', 'المخزون المتاح لا يكفي'))
                                    return
                                  }
                                  toast.error(t(increaseIssue.messageEn, increaseIssue.messageAr))
                                  return
                                }
                                updateQuantity(item.id, item.quantity + 1)
                              }}
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
                        className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    )
                  })}

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
                      {shipping === 0 ? t('Free Delivery', 'توصيل مجاني') : `${shipping} ${t('EGP', 'ج.م')}`}
                    </span>
                  </div>
                  {freeShippingRemaining > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t(
                        `Add ${freeShippingRemaining} EGP to get free delivery`,
                        `أضف ${freeShippingRemaining} ج للحصول على توصيل مجاني`
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
