'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Heart,
  Share2,
  Star,
  Minus,
  Plus,
  ChevronRight,
  Truck,
  Coffee,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import type { Product, ProductSize } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getStockState } from '@/lib/stock'

interface ProductDetailProps {
  product: Product & { category?: { name_en: string; name_ar: string; slug: string } | null }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { t, language } = useLanguage()
  const { addItem } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(
    product.sizes?.[0] || null
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const stockState = getStockState(product)
  const isOutOfStock = stockState === 'out_of_stock'
  const isLowStock = stockState === 'low_stock'
  const maxQty = isOutOfStock ? 0 : product.stock_quantity

  const name = language === 'ar' ? product.name_ar : product.name_en
  const description = language === 'ar' ? product.description_ar : product.description_en
  const categoryName = product.category
    ? language === 'ar'
      ? product.category.name_ar
      : product.category.name_en
    : null

  const handleAddToCart = () => {
    if (!selectedSize || isOutOfStock) return

    addItem({
      id: `${product.id}-${selectedSize.size}`,
      product_id: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      size: selectedSize.size as '250g' | '500g' | '1kg',
      price: selectedSize.price,
      quantity,
      image: product.images?.[0] || '',
      stock_quantity: product.stock_quantity,
    })

    toast.success(t('Added to cart', 'تمت الإضافة للسلة'), {
      description: `${name} (${selectedSize.size}) x ${quantity}`,
    })
  }

  const discount = selectedSize?.compare_at_price
    ? Math.round(((selectedSize.compare_at_price - selectedSize.price) / selectedSize.compare_at_price) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t('Home', 'الرئيسية')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">{t('Products', 'المنتجات')}</BreadcrumbLink>
          </BreadcrumbItem>
          {product.category && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/products?category=${product.category.slug}`}>
                  {categoryName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          {/* Main Image — cinematic 4:5 portrait */}
          <motion.div
            className="premium-image-card relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#120D09]"
            layoutId={`product-image-${product.id}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {product.images?.[selectedImageIndex] ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={name}
                    fill
                    className="object-cover object-center brightness-[0.82] contrast-[1.08] saturate-[1.05]"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingBag className="h-24 w-24 text-[#FFDCC2]/15" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Cinematic overlay — same system as product card */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#0a0300]/75 via-[#0a0300]/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#522500]/15 to-transparent mix-blend-multiply" />
            </div>

            {/* Badges — top left */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
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
              {discount > 0 && (
                <span className="text-[10px] tracking-[0.14em] uppercase font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-red-700/85 text-white">
                  -{discount}%
                </span>
              )}
            </div>
          </motion.div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`${t('View image', 'عرض الصورة')} ${index + 1}`}
                  className={cn(
                    'relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 bg-[#1e0b02]',
                    selectedImageIndex === index
                      ? 'border-[#c8941a]/70 shadow-[0_0_0_2px_rgba(200,148,26,0.15)]'
                      : 'border-[#522500]/20 hover:border-[#522500]/40 opacity-70 hover:opacity-100'
                  )}
                >
                  <Image
                    src={image}
                    alt={`${name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Origin & Rating */}
          <div className="flex items-center gap-4 text-sm">
            {product.origin && (
              <span className="text-muted-foreground">{product.origin}</span>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium">4.8</span>
              <span className="text-muted-foreground">(128 reviews)</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
            {name}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-muted-foreground text-pretty leading-relaxed">
              {description}
            </p>
          )}

          {/* Roast Level & Flavor Notes */}
          <div className="flex flex-wrap gap-4">
            {product.roast_level && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">
                  {t('Roast Level', 'درجة التحميص')}
                </span>
                <Badge variant="outline" className="capitalize border-[#B6885E]/25 bg-[#B6885E]/8 text-[#D6B79A]">
                  {product.roast_level}
                </Badge>
              </div>
            )}
            {product.flavor_notes && product.flavor_notes.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">
                  {t('Flavor Notes', 'ملاحظات النكهة')}
                </span>
                <div className="flex flex-wrap gap-1">
                  {product.flavor_notes.map((note) => (
                    <Badge key={note} variant="secondary" className="border border-[#B6885E]/20 bg-[#B6885E]/10 text-[#D6B79A] hover:bg-[#B6885E]/16">
                      {note}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {t('Size', 'الحجم')}
              </Label>
              <RadioGroup
                value={selectedSize?.id}
                onValueChange={(value) => {
                  const size = product.sizes?.find((s) => s.id === value)
                  if (size) setSelectedSize(size)
                }}
                className="flex flex-wrap gap-3"
              >
                {product.sizes.map((size) => (
                  <div key={size.id}>
                    <RadioGroupItem
                      value={size.id}
                      id={size.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={size.id}
                      className={cn(
                        'flex flex-col items-center justify-center px-6 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                        selectedSize?.id === size.id
                          ? 'border-[#D6A373]/65 bg-[#B6885E]/14 shadow-[0_0_32px_rgba(182,136,94,0.22)] ring-1 ring-[#D6A373]/22 text-[#F5E6D8]'
                          : 'border-[#B6885E]/18 bg-[#120D09]/55 text-[#D6B79A] hover:border-[#D6A373]/42 hover:bg-[#B6885E]/8 hover:text-[#F5E6D8]'
                      )}
                    >
                      <span className="font-medium">{size.size}</span>
                      <span className="text-sm text-primary font-semibold">
                        {size.price.toFixed(2)} EGP
                      </span>
                      {size.compare_at_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {size.compare_at_price.toFixed(2)} EGP
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Stock state */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                {t('Out of Stock', 'نفد المخزون')}
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {t(`Only ${product.stock_quantity} left`, `${product.stock_quantity} قطع فقط`)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/12 px-3 py-1 text-xs font-semibold text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {t('In Stock', 'متوفر')}
              </span>
            )}
          </div>

          {/* Quantity */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              {t('Quantity', 'الكمية')}
            </Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={t('Decrease quantity', 'تقليل الكمية')}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/42 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold text-lg text-[#F5E6D8]">{quantity}</span>
              <button
                type="button"
                aria-label={t('Increase quantity', 'زيادة الكمية')}
                onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                disabled={isOutOfStock || quantity >= maxQty}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/42 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-[#B6885E]/18">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {selectedSize ? (selectedSize.price * quantity).toFixed(2) : '0.00'} EGP
                </span>
                {selectedSize?.compare_at_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {(selectedSize.compare_at_price * quantity).toFixed(2)} EGP
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-sm text-destructive font-medium">
                  {t(`You save ${discount}%`, `توفير ${discount}%`)}
                </span>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                size="lg"
                className="premium-button flex-1 rounded-full sm:flex-none"
                onClick={handleAddToCart}
                disabled={!selectedSize || isOutOfStock}
              >
                <ShoppingBag className="h-5 w-5 me-2" />
                {isOutOfStock ? t('Out of Stock', 'نفد المخزون') : t('Add to Cart', 'أضف للسلة')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  toggleItem({
                    productId: product.id,
                    name_en: product.name_en,
                    name_ar: product.name_ar,
                    slug: product.slug,
                    image: product.images?.[0] || '',
                    price: selectedSize?.price || product.sizes?.[0]?.price || 0,
                  })
                  toast.success(
                    inWishlist
                      ? t('Removed from wishlist', 'تمت الإزالة من المفضلة')
                      : t('Added to wishlist', 'تمت الإضافة للمفضلة')
                  )
                }}
              >
                <Heart className={cn('h-5 w-5', inWishlist && 'fill-destructive text-destructive')} />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Product assurances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#B6885E]/15">
            <div className="premium-info-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t('Fast Delivery', 'توصيل سريع')}</p>
                <p className="text-xs text-muted-foreground">{t('Across Egypt', 'داخل مصر')}</p>
              </div>
            </div>
            <div className="premium-info-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Coffee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t('Freshly Roasted', 'تحميص طازج')}</p>
                <p className="text-xs text-muted-foreground">{t('Packed with care', 'تغليف بعناية')}</p>
              </div>
            </div>
            <div className="premium-info-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t('24/7 Support', 'دعم على مدار الساعة')}</p>
                <p className="text-xs text-muted-foreground">{t('Here when needed', 'معك عند الحاجة')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
