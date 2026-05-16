'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { useWishlistStore } from '@/lib/store/wishlist'
import { cn } from '@/lib/utils'

export default function DashboardWishlistPage() {
  const { t, dir, language } = useLanguage()
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const wishlistItems = isMounted ? items : []

  return (
    <div className="min-h-screen pb-8 pt-32 sm:pt-36 md:pt-40">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className={cn('mr-2 h-4 w-4', dir === 'rtl' && 'rotate-180')} />
            {t('Back to Dashboard', 'العودة للوحة التحكم')}
          </Link>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold">{t('Wishlist', 'المفضلة')}</h1>
              <p className="mt-2 text-muted-foreground">
                {t('Your saved Line Coffee products', 'منتجات لاين كوفي المحفوظة لديك')}
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <Button variant="outline" onClick={clearWishlist}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('Clear wishlist', 'مسح المفضلة')}
              </Button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <h2 className="font-serif text-2xl font-semibold">{t('No saved products yet', 'لا توجد منتجات محفوظة بعد')}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {t('Browse the collection and save products you want to revisit.', 'تصفح المجموعة واحفظ المنتجات التي تريد الرجوع إليها.')}
              </p>
              <Button asChild className="mt-6">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t('Shop Products', 'تسوق المنتجات')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <div key={item.productId} className="overflow-hidden rounded-xl border border-border bg-card">
                  <Link href={`/products/${item.slug}`} className="relative block aspect-[4/3] bg-secondary">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={language === 'ar' ? item.name_ar : item.name_en}
                      fill
                      className="object-cover"
                    />
                  </Link>
                  <div className="space-y-4 p-4">
                    <div>
                      <h2 className="line-clamp-2 font-semibold">
                        {language === 'ar' ? item.name_ar : item.name_en}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-primary">{item.price} {t('EGP', 'ج.م')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/products/${item.slug}`}>{t('View Product', 'عرض المنتج')}</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={t('Remove from wishlist', 'إزالة من المفضلة')}
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
