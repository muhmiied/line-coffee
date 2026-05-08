'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import type { Product, ProductSize } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t, language } = useLanguage()
  const { addItem } = useCartStore()
  const wishlistStore = useWishlistStore()
  const [isHovered, setIsHovered] = useState(false)

  const name = language === 'ar' ? product.name_ar : product.name_en
  const sizes = product.sizes || []
  const lowestPrice = sizes.length > 0
    ? Math.min(...sizes.map((s) => s.price))
    : 0
  const hasDiscount = sizes.some((s) => s.compare_at_price && s.compare_at_price > s.price)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const defaultSize = sizes.find((s) => s.size === '250g') || sizes[0]
    if (!defaultSize) return

    addItem({
      id: `${product.id}-${defaultSize.size}`,
      product_id: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      size: defaultSize.size as '250g' | '500g' | '1kg',
      price: defaultSize.price,
      quantity: 1,
      image: product.images?.[0] || '',
    })

    toast.success(t('Added to cart', 'تمت الإضافة للسلة'), {
      description: `${name} (${defaultSize.size})`,
    })
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={cardVariants}
      className={cn('group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_new && (
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  {t('New', 'جديد')}
                </Badge>
              )}
              {product.is_best_seller && (
                <Badge variant="secondary">
                  {t('Best Seller', 'الأكثر مبيعاً')}
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive">
                  {t('Sale', 'تخفيض')}
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute top-3 right-3 flex flex-col gap-2"
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const inWl = wishlistStore.isInWishlist(product.id)
                  wishlistStore.toggleItem({
                    productId: product.id,
                    name_en: product.name_en,
                    name_ar: product.name_ar,
                    slug: product.slug,
                    image: product.images?.[0] || '',
                    price: lowestPrice,
                  })
                  toast.success(inWl ? t('Removed from wishlist', 'تمت الإزالة من المفضلة') : t('Added to wishlist', 'تمت الإضافة للمفضلة'))
                }}
              >
                <Heart className={cn('h-4 w-4', wishlistStore.isInWishlist(product.id) && 'fill-destructive text-destructive')} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Quick Add Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              className="absolute bottom-3 left-3 right-3"
            >
              <Button
                className="w-full shadow-lg"
                size="sm"
                onClick={handleQuickAdd}
                style={{ backgroundColor: '#522500', color: '#FFDCC2' }}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t('Quick Add', 'إضافة سريعة')}
              </Button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Origin */}
            {product.origin && (
              <p className="text-xs text-muted-foreground mb-1">
                {product.origin}
              </p>
            )}

            {/* Name */}
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
              {name}
            </h3>

            {/* Roast Level & Rating */}
            <div className="flex items-center justify-between mb-3">
              {product.roast_level && (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                  {product.roast_level}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-xs font-medium">4.8</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-lg text-primary">
                {lowestPrice} {t('EGP', 'ج.م')}
              </span>
              {hasDiscount && sizes[0]?.compare_at_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {sizes[0].compare_at_price} {t('EGP', 'ج.م')}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
