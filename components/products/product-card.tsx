'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Star } from 'lucide-react'
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
  const lowestPrice = sizes.length > 0 ? Math.min(...sizes.map((s) => s.price)) : 0
  const hasDiscount = sizes.some((s) => s.compare_at_price && s.compare_at_price > s.price)
  const comparePrice = hasDiscount
    ? (sizes.find((s) => s.compare_at_price)?.compare_at_price ?? null)
    : null
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
    <motion.div
      variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn('group', className)}
    >
      <Link href={`/products/${product.slug}`} className="block">

        {/* ── Card shell ─────────────────────────────────────────── */}
        <div
          className={cn(
            'luxury-card relative overflow-hidden rounded-2xl',
            'bg-gradient-to-b from-[#1B140F] via-[#15100B] to-[#0B0806]',
            'border border-[#B6885E]/[16%]',
            'shadow-[0_16px_46px_rgba(0,0,0,0.34)]',
            'group-hover:border-[#D6A373]/[34%]',
          )}
        >

          {/* ── Image zone ─────────────────────────────────────────── */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#120D09]">

            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={name}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
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
                'opacity-0 group-hover:opacity-100',
                'scale-[0.84] group-hover:scale-100',
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
                  'absolute bottom-0 inset-x-0 p-3 z-10',
                  'translate-y-3 opacity-0',
                  'group-hover:translate-y-0 group-hover:opacity-100',
                  'transition-all duration-300 ease-out',
                )}
              >
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="premium-button flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t('Quick Add', 'إضافة سريعة')}
                </button>
              </div>
            )}
          </div>

          {/* ── Info zone ──────────────────────────────────────────── */}
          <div className="px-4 pb-5 pt-3.5 space-y-2">

            {/* Origin */}
            {product.origin && (
              <p className="text-[10px] tracking-[0.18em] uppercase font-medium text-[#D6B79A]/45">
                {product.origin}
              </p>
            )}

            {/* Name */}
            <h3 className="font-serif text-[15px] leading-snug font-semibold line-clamp-2 text-[#F5E6D8]/88 transition-colors duration-300 group-hover:text-[#F5E6D8]">
              {name}
            </h3>

            {/* Roast pill + rating */}
            <div className="flex items-center gap-2">
              {product.roast_level && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize bg-[#D6A373]/[8%] text-[#D6B79A]/58">
                  {product.roast_level}
                </span>
              )}
              <div className="flex items-center gap-0.5 ml-auto">
                <Star className="h-3 w-3 fill-[#D6A373] text-[#D6A373]" />
                <span className="text-[11px] font-medium text-[#D6A373]/68">4.8</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="text-lg font-bold text-[#D6A373]">{lowestPrice}</span>
              <span className="text-xs font-medium text-[#D6A373]/58">{t('EGP', 'ج.م')}</span>
              {comparePrice && (
                <span className="text-xs line-through ml-0.5 text-[#FFDCC2]/20">
                  {comparePrice}
                </span>
              )}
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  )
}
