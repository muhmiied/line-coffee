'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  className?: string
}

// Full Tailwind class strings — must be literal so the JIT scanner picks them up
const CATEGORY_GRADIENTS: Record<string, string> = {
  'turkish-coffee':  'from-[#1c0a00] to-[#3a1600]',
  'espresso':        'from-[#0e0500] to-[#2b0f00]',
  'flavored-coffee': 'from-[#1a0c00] to-[#3c1b00]',
  'cappuccino':      'from-[#231200] to-[#4b2900]',
  'coffee-mix':      'from-[#110800] to-[#2e1500]',
  'hot-chocolate':   'from-[#1b0700] to-[#3c1300]',
}

const WEIGHT_OPTIONS = ['250g', '500g', '1kg'] as const

function CinematicPlaceholder({ categoryId }: { categoryId: string }) {
  const grad = CATEGORY_GRADIENTS[categoryId] ?? 'from-[#1a0800] to-[#3e1900]'
  return (
    <div className={cn('absolute inset-0 bg-gradient-to-br flex items-center justify-center', grad)}>
      <div className="w-20 h-20 rounded-full bg-[#FFDCC2]/[4%] flex items-center justify-center ring-1 ring-[#FFDCC2]/[7%]">
        <ShoppingBag className="h-8 w-8 text-[#FFDCC2]/[18%]" />
      </div>
      {/* Warm radial glow at bottom — purely decorative */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-28 rounded-full bg-[#522500]/28 blur-2xl pointer-events-none" />
    </div>
  )
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t, language } = useLanguage()
  const { addItem } = useCartStore()
  const wishlistStore = useWishlistStore()
  const [wishlistPending, setWishlistPending] = useState(false)

  const name = language === 'ar' ? product.name_ar : product.name_en
  const sizes = product.sizes ?? []
  const description =
    (language === 'ar' ? product.description_ar : product.description_en)
    || product.description_en
    || product.description_ar
    || product.flavor_notes?.slice(0, 3).join(' - ')
    || ''
  const sizeOptions = WEIGHT_OPTIONS.map((weight) => ({
    weight,
    size: sizes.find((item) => item.size === weight),
  }))
  const lowestPrice = sizes.length > 0 ? Math.min(...sizes.map((s) => s.price)) : 0
  const hasDiscount = sizes.some((s) => s.compare_at_price && s.compare_at_price > s.price)
  const isSoldOut = product.stock_quantity === 0
  const inWishlist = wishlistStore.isInWishlist(product.id)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const defaultSize = sizes.find((s) => s.size === '250g') ?? sizes[0]
    if (!defaultSize) return
    addItem({
      id: `${product.id}-${defaultSize.size}`,
      product_id: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      size: defaultSize.size as '250g' | '500g' | '1kg',
      price: defaultSize.price,
      quantity: 1,
      image: product.images?.[0] ?? '',
    })
    toast.success(t('Added to cart', 'تمت الإضافة للسلة'), {
      description: `${name} (${defaultSize.size})`,
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlistPending(true)
    setTimeout(() => setWishlistPending(false), 300)
    wishlistStore.toggleItem({
      productId: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      slug: product.slug,
      image: product.images?.[0] ?? '',
      price: lowestPrice,
    })
    toast.success(
      inWishlist
        ? t('Removed from wishlist', 'تمت الإزالة من المفضلة')
        : t('Added to wishlist', 'تمت الإضافة للمفضلة')
    )
  }

  return (
    <div className={cn('group', className)}>
      <Link href={`/products/${product.slug}`} className="block">

        {/* ── Card shell ─────────────────────────────────────────── */}
        <div
          className={cn(
            'luxury-card relative overflow-hidden rounded-xl',
            'bg-gradient-to-b from-[#1B140F] via-[#15100B] to-[#0B0806]',
            'border border-[#B6885E]/[16%]',
            'shadow-[0_12px_34px_rgba(0,0,0,0.30)]',
            'group-hover:border-[#D6A373]/[34%]',
          )}
        >

          {/* ── Image zone ─────────────────────────────────────────── */}
          <div className="relative h-32 overflow-hidden bg-[#120D09] min-[380px]:h-36 sm:h-40 lg:h-44">

            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={name}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
                className="object-cover object-center brightness-[0.82] contrast-[1.08] saturate-[1.05] transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:brightness-[0.9]"
              />
            ) : (
              <CinematicPlaceholder categoryId={product.category_id ?? ''} />
            )}

            {/* Cinematic overlay system — unifies inconsistent photo lighting */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              {/* Bottom vignette: text legibility over any photo */}
              <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#0a0300]/90 via-[#0a0300]/40 to-transparent" />
              {/* Warm brown tone cast: corrects cold/blue-shifted photos */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#522500]/22 to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_12%,_rgba(214,163,115,0.14),_transparent_34%)]" />
            </div>

            {/* Sold-Out overlay */}
            {isSoldOut && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55">
                <span className="text-[10px] tracking-[0.18em] uppercase font-bold px-4 py-1.5 rounded-full bg-[#FFDCC2]/92 text-[#522500] shadow-md">
                  {t('Sold Out', 'نفد المخزون')}
                </span>
              </div>
            )}

            {/* Badges — top left */}
            {!isSoldOut && (product.is_new || product.is_best_seller || hasDiscount) && (
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {product.is_new && (
                  <span className="text-[10px] tracking-[0.14em] uppercase font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-[#FFDCC2]/90 text-[#522500]">
                    {t('New', 'جديد')}
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="text-[10px] tracking-[0.14em] uppercase font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-[#522500]/88 text-[#FFDCC2]">
                    {t('Best Seller', 'الأكثر مبيعاً')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-[10px] tracking-[0.14em] uppercase font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-red-700/85 text-white">
                    {t('Sale', 'تخفيض')}
                  </span>
                )}
              </div>
            )}

            {/* Wishlist — fades in on hover, top right */}
            <button
              type="button"
              aria-label={t('Wishlist', 'المفضلة')}
              onClick={handleWishlist}
              className={cn(
                'absolute top-3 right-3 z-10',
                'h-8 w-8 rounded-full flex items-center justify-center',
                'border border-[#B6885E]/20 bg-[#120D09]/82 backdrop-blur-md shadow-[0_12px_28px_rgba(0,0,0,0.35)]',
                'opacity-100 scale-100 sm:opacity-0 sm:scale-[0.84] sm:group-hover:opacity-100 sm:group-hover:scale-100',
                'transition-all duration-300 ease-out hover:border-[#D6A373]/45 hover:bg-[#B6885E]/15',
                wishlistPending && 'scale-110',
              )}
            >
              <Heart
                className={cn(
                  'h-3.5 w-3.5 transition-colors duration-150',
                  inWishlist ? 'fill-[#D6A373] text-[#D6A373]' : 'text-[#D6B79A]/75',
                )}
              />
            </button>

            {/* Quick Add — slides up from bottom on hover */}
            {!isSoldOut && (
              <div
                className={cn(
                  'absolute bottom-0 inset-x-0 p-2.5 z-10',
                  'translate-y-0 opacity-100 sm:translate-y-3 sm:opacity-0',
                  'sm:group-hover:translate-y-0 sm:group-hover:opacity-100',
                  'transition-all duration-300 ease-out',
                )}
              >
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="premium-button flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-semibold sm:gap-2 sm:text-sm"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t('Quick Add', 'إضافة سريعة')}
                </button>
              </div>
            )}
          </div>

          {/* ── Info zone ──────────────────────────────────────────── */}
          <div className="space-y-2.5 px-2.5 pb-3 pt-3 sm:px-3.5 sm:pb-4 sm:pt-3.5">

            {/* Name + description */}
            <div className="space-y-1.5">
              <h3 className="line-clamp-1 font-serif text-[14px] font-semibold leading-snug text-[#F5E6D8]/90 transition-colors duration-300 group-hover:text-[#F5E6D8] sm:text-[15px]">
                {name}
              </h3>
              {description && (
                <p className="line-clamp-2 min-h-[2rem] text-[11px] leading-4 text-[#D6B79A]/58 sm:text-xs">
                  {description}
                </p>
              )}
            </div>

            {/* Weight prices */}
            <div className="grid grid-cols-3 gap-1">
              {sizeOptions.map(({ weight, size }) => {
                const unavailable = !size || size.is_available === false

                return (
                  <div
                    key={weight}
                    className={cn(
                      'rounded-lg border px-1 py-1.5 text-center transition-colors sm:px-1.5 sm:py-2',
                      unavailable
                        ? 'border-[#B6885E]/10 bg-[#0F0A07]/55 text-[#D6B79A]/35'
                        : 'border-[#B6885E]/22 bg-[#D6A373]/[0.055] text-[#F5E6D8] group-hover:border-[#D6A373]/36',
                    )}
                  >
                    <p className="text-[10px] font-semibold leading-none tracking-[0.02em] sm:text-[11px]">{weight}</p>
                    <p className="mt-1 text-[9px] font-bold leading-tight text-[#D6A373] min-[380px]:text-[10px] sm:text-[11px]">
                      {size ? `${size.price} ${t('EGP', 'ج.م')}` : t('N/A', 'N/A')}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </Link>
    </div>
  )
}
