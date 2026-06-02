'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, PackageSearch, Sparkles, ChevronRight, Check, X, ShoppingBag, Coffee, Scale, SlidersHorizontal, Minus, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/product-card'
import { getCustomStockIssue } from '@/lib/custom-stock'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'
import {
  calculateBlendPrice,
  calculateFlavorPrice,
  applyOfficialBeanSalePrice,
  CUSTOMIZE_FLAVOR_ADDITIONS,
  CUSTOMIZE_FLAVOR_BASES,
  DEFAULT_CUSTOM_BLEND_BEANS,
  type CoffeeBeanOption,
  type FlavorAdditionOption,
  type FlavorBaseOption,
  type PackageSize,
} from '@/lib/config/customization'
import {
  CATEGORY_SLUG_ALIASES,
  LAST_RESORT_PRODUCTS as OFFICIAL_LAST_RESORT_PRODUCTS,
  OFFICIAL_PRODUCT_CATEGORIES,
  PRODUCT_IMAGE_LIBRARY,
} from '@/lib/config/product-system'
import {
  analyzeEspressoBlend,
  calculateEspressoBlendMetrics,
  ESPRESSO_PROFILE_OPTIONS,
  getEspressoBeanMetrics,
  recommendEspressoBlend,
  suggestSmartEspressoRatios,
  type EspressoBodyPreference,
  type EspressoPreferences,
  type EspressoProfileId,
} from '@/lib/config/espresso-intelligence'
import {
  IndicatorBar,
  LiveConfiguratorPanel,
  PremiumConfiguratorShell,
  PremiumOptionCard,
} from '@/components/products/premium-configurator'
import { getMediaObjectPosition, getMediaOverlayOpacity, type SiteMediaItem } from '@/lib/media'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────────────────────────
type DbCategory = {
  id: string
  slug: string
  name_en: string
  name_ar: string
  image_url: string | null
}

type SidebarCategory = {
  slug: string
  nameEn: string
  nameAr: string
  isCustomizeBlend?: boolean
  isCustomizeFlavor?: boolean
}

// ─── Fallback categories shown when DB fetch returns empty ────────────────────
const FALLBACK_DB_CATEGORIES: DbCategory[] = [
  ...OFFICIAL_PRODUCT_CATEGORIES.map((category) => ({
    id: category.id,
    slug: category.slug,
    name_en: category.name_en,
    name_ar: category.name_ar,
    image_url: category.image_url,
  })),
]

// ─── Static special sidebar entries (not stored in DB) ─────────────────────────
const CUSTOMIZE_FLAVOR_ENTRY: SidebarCategory = { slug: 'customize-flavor', nameEn: 'Make Your Flavor', nameAr: 'اصنع نكهتك', isCustomizeFlavor: true }
const DEFAULT_CATEGORY_SLUG = 'turkish-coffee'
const FIXED_OFFICIAL_CATEGORY_SLUGS = new Set(['turkish-coffee', 'espresso-blends', 'easy-coffee'])
const FALLBACK_WHEN_EMPTY_CATEGORY_SLUGS = new Set(['hot-chocolate'])
const NO_CHUNK_PRODUCT_CATEGORY_SLUGS = new Set(['coffee-mix', 'cappuccino', 'hot-chocolate'])

const customFlavorOptions: FlavorAdditionOption[] = CUSTOMIZE_FLAVOR_ADDITIONS

// ─── Flavor base options for customize-flavor ──────────────────────────────────
const flavorBaseOptions = CUSTOMIZE_FLAVOR_BASES

const CUSTOMIZE_FLAVOR_GROUPS = [
  { key: 'sweets', nameEn: 'Sweets LINE', nameAr: 'خط الحلويات', min: 1, max: 8 },
  { key: 'nuts', nameEn: 'Nuts', nameAr: 'مكسرات', min: 9, max: 12 },
  { key: 'fruits', nameEn: 'Fruits', nameAr: 'فواكه', min: 13, max: 24 },
  { key: 'special', nameEn: 'Special Order', nameAr: 'طلبات خاصة', min: 25, max: 30 },
]

function getCustomizeFlavorGroup(sortOrder: number | undefined) {
  const order = Number(sortOrder || 0)
  return CUSTOMIZE_FLAVOR_GROUPS.find((group) => order >= group.min && order <= group.max) || CUSTOMIZE_FLAVOR_GROUPS[3]
}

const SIZE_OPTIONS: PackageSize[] = ['250g', '500g', '1kg']

function getFlavorBaseImage(baseId: string) {
  if (baseId === 'turkish-coffee') return PRODUCT_IMAGE_LIBRARY.turkish
  if (baseId === 'cappuccino') return PRODUCT_IMAGE_LIBRARY.cappuccino
  if (baseId === 'hot-chocolate') return PRODUCT_IMAGE_LIBRARY.hotChocolate
  return PRODUCT_IMAGE_LIBRARY.coffeeMix
}

function formatOptionName(language: 'en' | 'ar', item: { nameEn: string; nameAr: string }) {
  return language === 'ar' ? item.nameAr : item.nameEn
}

function formatOptionDescription(
  language: 'en' | 'ar',
  item: { descriptionEn?: string; descriptionAr?: string; descEn?: string; descAr?: string },
) {
  return language === 'ar'
    ? item.descriptionAr || item.descAr || item.descriptionEn || item.descEn || ''
    : item.descriptionEn || item.descEn || item.descriptionAr || item.descAr || ''
}

function normalizeCategorySlug(slug: string | null | undefined) {
  if (!slug || slug === 'all' || slug === 'customize-flavor') return slug || 'all'
  return CATEGORY_SLUG_ALIASES[slug] ?? slug
}

function getBeanNotes(language: 'en' | 'ar', bean: CoffeeBeanOption) {
  const notes = language === 'ar' ? bean.tastingNotesAr : bean.tastingNotesEn
  if (notes?.length) return notes.slice(0, 3)
  return (language === 'ar' ? bean.descAr : bean.descEn)
    .split(/[،,.]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function formatRatio(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function isOptionOutOfStock(option: {
  stockQuantity?: number
  isManuallyOutOfStock?: boolean
}) {
  return option.isManuallyOutOfStock === true ||
    (typeof option.stockQuantity === 'number' && option.stockQuantity <= 0)
}

function getFlavorAvailability(flavor: FlavorAdditionOption, baseId: string) {
  return flavor.availabilityByBase?.[baseId] ?? {
    stockQuantity: flavor.stockQuantity,
    lowStockThreshold: flavor.lowStockThreshold,
    isManuallyOutOfStock: flavor.isManuallyOutOfStock,
  }
}

function isChunkProduct(product: Product) {
  return /chunks?|pieces?|قطع/i.test(`${product.slug} ${product.name_en} ${product.name_ar}`)
}

// ─── Make Your Espresso Component ──────────────────────────────────────────────
function MakeYourEspressoBlend() {
  const { t, language } = useLanguage()
  const { addItem, items } = useCartStore()
  const [blendMode, setBlendMode] = useState<'quick' | 'custom'>('quick')
  const [beanOptions, setBeanOptions] = useState<CoffeeBeanOption[]>(
    DEFAULT_CUSTOM_BLEND_BEANS.filter((bean) => bean.isVisible),
  )
  const [selectedBeans, setSelectedBeans] = useState<Array<CoffeeBeanOption & { percent: string }>>([])
  const [selectedSize, setSelectedSize] = useState<PackageSize>('250g')
  const [blendQuantity, setBlendQuantity] = useState(1)
  const [espressoPreferences, setEspressoPreferences] = useState<EspressoPreferences>({
    profileId: 'balanced',
    body: 'medium',
    arabicaOnly: false,
    budgetAware: false,
  })

  const groupedBeans = useMemo(() => {
    const visible = beanOptions.filter((bean) => bean.isVisible)
    return {
      arabica: visible.filter((bean) => bean.family === 'arabica'),
      robusta: visible.filter((bean) => bean.family === 'robusta'),
    }
  }, [beanOptions])

  const selectedSmartRatios = useMemo(
    () => suggestSmartEspressoRatios(selectedBeans, espressoPreferences),
    [selectedBeans, espressoPreferences],
  )

  const finalBlendBeans = useMemo(() => {
    const smartRatioById = new Map(selectedSmartRatios.map(({ bean, percent }) => [bean.id, percent]))
    const customTotal = selectedBeans.reduce((sum, bean) => sum + Number(bean.percent || 0), 0)
    const useSmartPreview = blendMode === 'quick' || customTotal <= 0

    return selectedBeans.map((bean) => ({
      ...bean,
      finalPercent: useSmartPreview
        ? smartRatioById.get(bean.id) ?? 0
        : Number(bean.percent || 0),
    }))
  }, [blendMode, selectedBeans, selectedSmartRatios])

  const espressoRecommendation = useMemo(
    () => recommendEspressoBlend(beanOptions, espressoPreferences),
    [beanOptions, espressoPreferences],
  )
  const blendMetrics = useMemo(
    () => calculateEspressoBlendMetrics(finalBlendBeans),
    [finalBlendBeans],
  )
  const blendAdvice = useMemo(
    () => analyzeEspressoBlend(finalBlendBeans, espressoPreferences),
    [finalBlendBeans, espressoPreferences],
  )

  const ratioTotal = finalBlendBeans.reduce((sum, bean) => sum + bean.finalPercent, 0)
  const ratioIsValid = blendMode === 'quick'
    ? selectedBeans.length > 0
    : selectedBeans.length > 0
      && selectedBeans.every((bean) => Number(bean.percent || 0) > 0)
      && Math.round(ratioTotal * 10) / 10 === 100
  const totalPrice = finalBlendBeans.length > 0
    ? calculateBlendPrice(finalBlendBeans.map((bean) => ({ price: bean.price, percent: bean.finalPercent })), 'ratios', selectedSize, false)
    : 0
  const blendDisplayPrice = totalPrice * blendQuantity
  const blendPartEn = finalBlendBeans
    .map((bean) => `${bean.nameEn} ${formatRatio(bean.finalPercent)}%`)
    .join(' + ')
  const blendPartAr = finalBlendBeans
    .map((bean) => `${bean.nameAr} ${formatRatio(bean.finalPercent)}%`)
    .join(' + ')
  const blendKey = finalBlendBeans
    .map((bean) => `${bean.id}-${formatRatio(bean.finalPercent)}`)
    .join('-')
  const blendCartItem = finalBlendBeans.length > 0 ? {
    id: `espresso-blend-${blendKey}-${selectedSize}`,
    product_id: 'build-your-espresso',
    name_en: 'Make Your Espresso',
    name_ar: 'اصنع إسبريسو خاصتك',
    size: selectedSize,
    price: totalPrice,
    quantity: blendQuantity,
    image: PRODUCT_IMAGE_LIBRARY.espresso,
    customizations: {
      type: 'espresso-blend',
      mode: blendMode,
      title_en: 'Make Your Espresso',
      title_ar: 'اصنع إسبريسو خاصتك',
      summary_en: blendPartEn,
      summary_ar: blendPartAr,
      beans: finalBlendBeans.map((bean) => ({
        id: bean.id,
        name_en: bean.nameEn,
        name_ar: bean.nameAr,
        family: bean.family,
        origin: bean.origin ?? null,
        percent: bean.finalPercent,
        stock_quantity: bean.stockQuantity ?? null,
        is_manually_out_of_stock: bean.isManuallyOutOfStock === true,
      })),
    },
  } : null
  const blendStockIssue = blendCartItem
    ? getCustomStockIssue(items, blendCartItem, blendQuantity)
    : null

  useEffect(() => {
    fetch('/api/customization-options', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const beans = d?.data?.beans
        if (Array.isArray(beans)) {
          const saleBeans = beans.map((bean: CoffeeBeanOption) => applyOfficialBeanSalePrice(bean))
          setBeanOptions(saleBeans)
          setSelectedBeans((current) => current
            .map((bean) => {
              const match = saleBeans.find((item) => item.id === bean.id)
              return match ? { ...match, percent: bean.percent } : bean
            })
            .filter((bean) => saleBeans.some((item) => item.id === bean.id && !isOptionOutOfStock(item)))
          )
        }
      })
      .catch(() => {})
  }, [])

  const toggleBean = (bean: CoffeeBeanOption) => {
    if (isOptionOutOfStock(bean)) {
      toast.error(t('This bean is out of stock', 'هذا النوع غير متاح حالياً'))
      return
    }

    setSelectedBeans((prev) => {
      const exists = prev.some((item) => item.id === bean.id)
      return exists
        ? prev.filter((item) => item.id !== bean.id)
        : [...prev, { ...bean, percent: blendMode === 'custom' ? '0' : '' }]
    })
  }

  const handleBlendModeChange = (mode: 'quick' | 'custom') => {
    if (mode === blendMode) return

    if (mode === 'custom') {
      const smartRatioById = new Map(selectedSmartRatios.map(({ bean, percent }) => [bean.id, percent]))
      setSelectedBeans((prev) => prev.map((bean) => ({
        ...bean,
        percent: formatRatio(smartRatioById.get(bean.id) ?? 0),
      })))
    }

    setBlendMode(mode)
  }

  const updateEspressoPreference = <Key extends keyof EspressoPreferences>(
    key: Key,
    value: EspressoPreferences[Key],
  ) => {
    setEspressoPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const applySuggestedBlend = () => {
    if (espressoRecommendation.beans.length === 0) {
      toast.error(t('No available beans for a suggestion', 'لا توجد حبوب متاحة للاقتراح'))
      return
    }

    setBlendMode('custom')
    setSelectedBeans(espressoRecommendation.beans.map(({ bean, percent }) => ({
      ...bean,
      percent: formatRatio(percent),
    })))
    toast.success(t('Suggested blend applied', 'تم تطبيق التوليفة المقترحة'))
  }

  const applySmartRatios = () => {
    if (selectedSmartRatios.length === 0) {
      toast.error(t('Select beans first', 'اختر الحبوب أولا'))
      return
    }

    const smartRatioById = new Map(selectedSmartRatios.map(({ bean, percent }) => [bean.id, percent]))
    setBlendMode('custom')
    setSelectedBeans((prev) => prev.map((bean) => ({
      ...bean,
      percent: formatRatio(smartRatioById.get(bean.id) ?? 0),
    })))
    toast.success(t('Smart ratios applied', 'تم تطبيق النسب الذكية'))
  }

  const updateBeanPercent = (id: string, val: string) => {
    const rawValue = Number(val)
    const nextValue = val === '' || !Number.isFinite(rawValue)
      ? ''
      : String(Math.min(100, Math.max(0, rawValue)))
    setSelectedBeans((prev) => prev.map((bean) => (bean.id === id ? { ...bean, percent: nextValue } : bean)))
  }

  const handleAdd = () => {
    if (selectedBeans.length === 0) {
      toast.error(t('Select at least one bean', 'اختر نوع بن واحد على الأقل'))
      return
    }

    if (!ratioIsValid) {
      toast.error(t('Set ratios to exactly 100%', 'اجعل مجموع النسب 100% بالضبط'))
      return
    }

    if (!blendCartItem) return

    if (blendStockIssue) {
      toast.error(t(blendStockIssue.messageEn, blendStockIssue.messageAr))
      return
    }

    addItem(blendCartItem)
    toast.success(t('Added to cart!', 'تمت الإضافة للسلة!'))
    return
  }


  const renderBeanGroup = (
    family: 'arabica' | 'robusta',
    titleEn: string,
    titleAr: string,
    descriptionEn: string,
    descriptionAr: string,
  ) => (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#B6885E]/15 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-[#D6A373]" />
            <h3 className="font-serif text-2xl font-bold text-[#F5E6D8]">{t(titleEn, titleAr)}</h3>
            <span className="rounded-full bg-[#B6885E]/12 px-3 py-1 text-xs font-semibold text-[#D6A373]">
              {groupedBeans[family].length} {t('Types', 'أنواع')}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#D6B79A]/75">{t(descriptionEn, descriptionAr)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1760px]:grid-cols-4">
        {groupedBeans[family].map((bean) => {
          const selectedBean = finalBlendBeans.find((item) => item.id === bean.id)
          const selected = Boolean(selectedBean)
          const outOfStock = isOptionOutOfStock(bean)
          const beanMetrics = getEspressoBeanMetrics(bean)
          return (
            <article
              role="button"
              aria-disabled={outOfStock}
              tabIndex={outOfStock ? -1 : 0}
              key={bean.id}
              onClick={() => {
                if (!outOfStock) toggleBean(bean)
              }}
              onKeyDown={(event) => {
                if (!outOfStock && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  toggleBean(bean)
                }
              }}
              className={cn(
                'group relative min-h-[15.5rem] overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-4',
                'bg-gradient-to-br from-[#1B140F]/90 to-[#0B0806]/88',
                outOfStock
                  ? 'cursor-not-allowed border-[#B6885E]/8 opacity-45 grayscale'
                  : selected
                    ? 'border-[#D6A373]/55 bg-[#B6885E]/9 shadow-[0_0_38px_rgba(182,136,94,0.18)] hover:-translate-y-1'
                    : 'border-[#B6885E]/16 hover:-translate-y-1 hover:border-[#D6A373]/38 hover:bg-[#B6885E]/5',
              )}
            >
              {outOfStock && (
                <div className="pointer-events-none absolute inset-0 z-10 bg-[#0B0806]/22" />
              )}
              {outOfStock && (
                <span className="absolute right-4 top-4 z-20 rounded-full border border-red-300/20 bg-red-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-200">
                  {t('Out of Stock', 'غير متاح')}
                </span>
              )}
              <div className="pointer-events-none absolute right-4 top-4 h-12 w-12 rounded-full bg-[#B6885E]/10 blur-xl transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex min-h-[13.5rem] h-full flex-col justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="min-w-0 pr-1 font-serif text-base font-bold leading-tight text-[#F5E6D8] sm:text-lg">
                      {formatOptionName(language, bean)}
                    </h4>
                    <span className={cn(
                      'relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors',
                      selected ? 'border-[#D6A373] bg-[#D6A373] text-[#0B0806]' : 'border-[#B6885E]/30 text-[#D6A373]',
                    )}>
                      {selected ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-[2.45rem] text-xs leading-relaxed text-[#D6B79A]/76 sm:text-sm">
                    {language === 'ar' ? bean.descAr : bean.descEn}
                  </p>
                  <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D6A373]/72">
                    {t('Tasting notes', 'إيحاءات التذوق')}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {getBeanNotes(language, bean).map((note) => (
                      <span key={note} className="max-w-[7.5rem] truncate rounded-full border border-[#B6885E]/14 bg-[#B6885E]/8 px-2 py-0.5 text-[10px] font-medium text-[#D6B79A]/72">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-auto space-y-2.5">
                  <div className="grid gap-1.5">
                    <IndicatorBar label={t('Body', 'القوام')} value={beanMetrics.body} />
                    <IndicatorBar label={t('Acidity', 'الحموضة')} value={beanMetrics.acidity} />
                    <IndicatorBar label={t('Crema', 'الكريما')} value={beanMetrics.crema} />
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-[#B6885E]/10 bg-[#0B0806]/35 px-2.5 py-2 text-[11px] text-[#D6A373]">
                    <span className="min-w-0 truncate">{bean.origin || t('Premium origin', 'منشأ فاخر')}</span>
                    <span className="shrink-0 whitespace-nowrap">{bean.price} {t('EGP/kg', 'ج.م/كجم')}</span>
                  </div>
                  {selected && blendMode === 'custom' && (
                    <div
                      className="flex items-center gap-2 rounded-xl border border-[#D6A373]/18 bg-[#0B0806]/55 p-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={selectedBeans.find((item) => item.id === bean.id)?.percent ?? ''}
                        onChange={(event) => updateBeanPercent(bean.id, event.target.value)}
                        placeholder="0"
                        className="h-9 border-[#B6885E]/18 bg-[#120D09]/80 text-center text-sm"
                      />
                      <span className="text-sm font-semibold text-[#D6A373]">%</span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )

  return (
    <PremiumConfiguratorShell
      icon={<Sparkles className="h-7 w-7 text-[#D6A373]" />}
      eyebrow={t('Specialty whole beans', 'حبوب مختصة كاملة')}
      title={t('Make Your Espresso', 'اصنع إسبريسو خاصتك')}
      description={t(
        'Buy a single origin alone or compose a custom whole-bean espresso blend with live ratios and specialty profiles.',
        'اشتر منشأ واحدًا أو اصنع توليفة إسبريسو من الحبوب الكاملة مع نسب مباشرة وملفات مختصة.',
      )}
    >
      <div className="border-b border-[#B6885E]/15 p-5 sm:p-6 lg:p-8">
        <div className="grid gap-2 rounded-2xl border border-[#B6885E]/15 bg-[#0B0806]/55 p-1 sm:max-w-md sm:grid-cols-2">
          {([
            { value: 'quick' as const, labelEn: 'Quick Select', labelAr: 'اختيار سريع' },
            { value: 'custom' as const, labelEn: 'Custom Ratios', labelAr: 'نسب مخصصة' },
          ]).map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => handleBlendModeChange(mode.value)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                blendMode === mode.value
                  ? 'bg-[#D6A373] text-[#0B0806] shadow-[0_8px_24px_rgba(182,136,94,0.18)]'
                  : 'text-[#D6B79A]/75 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8]',
              )}
            >
              {t(mode.labelEn, mode.labelAr)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
        <div className="space-y-8">
          <section className="rounded-2xl border border-[#B6885E]/18 bg-[#120D09]/68 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#D6A373]" />
                  <h3 className="font-serif text-xl font-bold text-[#D6A373]">{t('Guide Me', 'رشح لي')}</h3>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#D6B79A]/72">
                  {t('Choose a direction and apply a clean suggested ratio.', 'اختر الاتجاه وطبق نسبة مقترحة بسيطة.')}
                </p>
              </div>
              <Button type="button" onClick={applySuggestedBlend} className="premium-button shrink-0 rounded-full">
                {t('Apply Suggested Blend', 'طبق التوليفة المقترحة')}
              </Button>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-5">
                {ESPRESSO_PROFILE_OPTIONS.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => updateEspressoPreference('profileId', profile.id as EspressoProfileId)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200',
                      espressoPreferences.profileId === profile.id
                        ? 'border-[#D6A373]/55 bg-[#D6A373] text-[#0B0806]'
                        : 'border-[#B6885E]/16 bg-[#0B0806]/45 text-[#D6B79A] hover:border-[#D6A373]/38 hover:text-[#F5E6D8]',
                    )}
                  >
                    {t(profile.labelEn, profile.labelAr)}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid grid-cols-2 gap-2 sm:w-64">
                  {([
                    { value: 'medium' as EspressoBodyPreference, labelEn: 'Medium Body', labelAr: 'قوام متوسط' },
                    { value: 'full' as EspressoBodyPreference, labelEn: 'Full Body', labelAr: 'قوام ممتلئ' },
                  ]).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateEspressoPreference('body', option.value)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200',
                        espressoPreferences.body === option.value
                          ? 'border-[#D6A373]/55 bg-[#D6A373]/16 text-[#D6A373]'
                          : 'border-[#B6885E]/16 bg-[#0B0806]/45 text-[#D6B79A]/75 hover:border-[#D6A373]/38 hover:text-[#F5E6D8]',
                      )}
                    >
                      {t(option.labelEn, option.labelAr)}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {([
                    { key: 'arabicaOnly' as const, labelEn: '100% Arabica', labelAr: 'أرابيكا 100%' },
                    { key: 'budgetAware' as const, labelEn: 'Budget-aware', labelAr: 'يراعي الميزانية' },
                  ]).map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => updateEspressoPreference(option.key, !espressoPreferences[option.key])}
                      className={cn(
                        'rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-200',
                        espressoPreferences[option.key]
                          ? 'border-[#D6A373]/55 bg-[#D6A373]/16 text-[#D6A373]'
                          : 'border-[#B6885E]/16 bg-[#0B0806]/45 text-[#D6B79A]/75 hover:border-[#D6A373]/38 hover:text-[#F5E6D8]',
                      )}
                    >
                      {t(option.labelEn, option.labelAr)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#B6885E]/12 bg-[#0B0806]/45 p-3">
                <p className="text-xs leading-relaxed text-[#D6B79A]/68">
                  {t(espressoRecommendation.reasonEn, espressoRecommendation.reasonAr)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {espressoRecommendation.beans.map(({ bean, percent }) => (
                    <span key={bean.id} className="rounded-full border border-[#D6A373]/24 bg-[#D6A373]/10 px-2.5 py-1 text-xs font-medium text-[#D6A373]">
                      {formatOptionName(language, bean)} {formatRatio(percent)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#B6885E]/18 bg-[#120D09]/68 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B6885E]/12 ring-1 ring-[#B6885E]/22">
                  <Scale className="h-6 w-6 text-[#D6A373]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#D6A373]">
                    {t('Smart Blend Assistant', 'مساعد التوليفة الذكي')}
                  </h3>
                  <p className="text-sm text-[#D6B79A]/72">
                    {blendMode === 'custom'
                      ? t('Adjust each selected bean until the total reaches 100%.', 'اضبط كل نوع بن حتى يصل المجموع إلى 100%.')
                      : t('Use Guide Me or switch to custom ratios for more control.', 'استخدم رشح لي أو انتقل للنسب المخصصة لتحكم أكبر.')}
                  </p>
                </div>
              </div>
              {blendMode === 'custom' && (
                <div className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold',
                  ratioIsValid ? 'border-[#D6A373]/25 bg-[#D6A373]/10 text-[#D6A373]' : 'border-red-400/25 bg-red-500/10 text-red-300',
                )}>
                  {t('Total', 'المجموع')}: {formatRatio(ratioTotal || 0)}%
                </div>
              )}
              <Button
                type="button"
                onClick={applySmartRatios}
                disabled={selectedBeans.length === 0}
                className="premium-button shrink-0 rounded-full"
              >
                {t('Apply Smart Ratios', 'طبّق النسب الذكية')}
              </Button>
            </div>

            {selectedBeans.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-[#B6885E]/28 px-4 py-6 text-center text-sm text-[#D6B79A]/65">
                {t('Selected beans will appear here.', 'ستظهر أنواع البن المختارة هنا.')}
              </p>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                {finalBlendBeans.map((bean) => (
                  <span key={bean.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#B6885E]/18 bg-[#0B0806]/55 px-3 py-2 text-sm">
                    <span className="min-w-0 truncate font-semibold text-[#F5E6D8]">{formatOptionName(language, bean)}</span>
                    <span className="shrink-0 font-bold text-[#D6A373]">{formatRatio(bean.finalPercent)}%</span>
                    <button type="button" onClick={() => toggleBean(bean)} className="shrink-0 rounded-full p-0.5 text-[#D6B79A]/55 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8]">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {blendMetrics && (
              <div className="mt-5 grid gap-2 rounded-xl border border-[#B6885E]/12 bg-[#0B0806]/45 p-4">
                <IndicatorBar label={t('Blend Body', 'قوام التوليفة')} value={blendMetrics.body} />
                <IndicatorBar label={t('Blend Acidity', 'حموضة التوليفة')} value={blendMetrics.acidity} />
                <IndicatorBar label={t('Blend Crema', 'كريما التوليفة')} value={blendMetrics.crema} />
                <IndicatorBar label={t('Blend Strength', 'قوة التوليفة')} value={blendMetrics.strength} />
              </div>
            )}

            {blendAdvice && (
              <p className={cn(
                'mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed',
                blendAdvice.tone === 'warning'
                  ? 'border-red-400/20 bg-red-500/10 text-red-200'
                  : 'border-[#D6A373]/20 bg-[#D6A373]/10 text-[#D6B79A]',
              )}>
                {t(blendAdvice.messageEn, blendAdvice.messageAr)}
              </p>
            )}
          </section>

          {renderBeanGroup('arabica', 'Arabica', 'أرابيكا', 'Smooth, aromatic and complex with lower bitterness.', 'ناعمة وعطرية ومعقدة بمرارة أقل.')}
          {renderBeanGroup('robusta', 'Robusta', 'روبوستا', 'Bold, rich and high-caffeine beans for stronger blends.', 'قوية وغنية وعالية الكافيين لتوليفات أثقل.')}
        </div>

        <LiveConfiguratorPanel
          eyebrow={t('Live Price', 'السعر المباشر')}
          price={blendDisplayPrice}
          currency={t('EGP', 'ج.م')}
          note={t('Updates instantly as you customize whole-bean origins.', 'يتغير فورًا مع تخصيص مناشئ الحبوب الكاملة.')}
        >
            <div className="rounded-xl border border-[#B6885E]/14 bg-[#120D09]/70 p-4">
                <p className="mb-3 text-sm font-semibold text-[#F5E6D8]">
                  {t(`Selected Beans (${selectedBeans.length})`, `الحبوب المختارة (${selectedBeans.length})`)}
                </p>
                {selectedBeans.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[#B6885E]/18 px-3 py-3 text-center text-xs text-[#D6B79A]/50">
                    {t('Select beans to start your blend.', 'اختر حبوب لبدء التوليفة.')}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {finalBlendBeans.map((bean) => (
                      <div key={bean.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#B6885E]/12 bg-[#120D09]/55 px-3 py-2 text-xs">
                        <span className="truncate font-medium text-[#F5E6D8]/82">{formatOptionName(language, bean)}</span>
                        <span className="shrink-0 font-bold text-[#D6A373]">{formatRatio(bean.finalPercent)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#F5E6D8]">{t('Weight', 'الوزن')}</p>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'rounded-xl border px-2 py-3 text-sm font-semibold transition-all duration-200',
                      selectedSize === size ? 'border-[#D6A373]/55 bg-[#D6A373] text-[#0B0806] shadow-[0_0_18px_rgba(182,136,94,0.22)]' : 'border-[#B6885E]/16 bg-[#120D09]/70 text-[#D6B79A] hover:border-[#D6A373]/38 hover:bg-[#B6885E]/8 hover:text-[#F5E6D8]',
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#F5E6D8]">{t('Quantity', 'الكمية')}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setBlendQuantity((q) => Math.max(1, q - 1))}
                  disabled={blendQuantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/40 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-base font-semibold text-[#F5E6D8]">{blendQuantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setBlendQuantity((q) => q + 1)}
                  disabled={!blendCartItem}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/40 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {selectedBeans.length > 0 && blendMode === 'custom' && !ratioIsValid && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {t('Total ratio must equal 100%', 'مجموع النسب يجب أن يساوي 100%')}
              </p>
            )}

            {blendStockIssue && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {t(blendStockIssue.messageEn, blendStockIssue.messageAr)}
              </p>
            )}

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={selectedBeans.length === 0 || !ratioIsValid || Boolean(blendStockIssue)}
              className="premium-button w-full gap-2 rounded-full"
            >
              <ShoppingBag className="h-5 w-5" />
              {t('Add to Cart', 'أضف للسلة')}
            </Button>
        </LiveConfiguratorPanel>
      </div>
    </PremiumConfiguratorShell>
  )
}

// ─── Customize Flavor Component ────────────────────────────────────────────────
function CustomizeFlavor() {
  const { t, language } = useLanguage()
  const { addItem, items } = useCartStore()
  const [baseOptions, setBaseOptions] = useState<FlavorBaseOption[]>(flavorBaseOptions)
  const [additionOptions, setAdditionOptions] = useState<FlavorAdditionOption[]>(customFlavorOptions)
  const [selectedBase, setSelectedBase] = useState<FlavorBaseOption>(flavorBaseOptions[0])
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorAdditionOption[]>([])
  const [selectedSize, setSelectedSize] = useState<PackageSize>('250g')
  const [flavorQuantity, setFlavorQuantity] = useState(1)
  const valveBag = false

  const filteredAdditions = useMemo(() => {
    return additionOptions.filter((flavor) => !flavor.bases || flavor.bases.includes(selectedBase.id))
  }, [additionOptions, selectedBase.id])

  const groupedFilteredAdditions = useMemo(() => {
    return CUSTOMIZE_FLAVOR_GROUPS
      .map((group) => ({
        group,
        flavors: filteredAdditions
          .filter((flavor) => (flavor.group || getCustomizeFlavorGroup(flavor.sortOrder).key) === group.key)
          .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)),
      }))
      .filter((entry) => entry.flavors.length > 0)
  }, [filteredAdditions])

  const totalPrice = selectedBase
    ? calculateFlavorPrice(selectedBase.price, selectedFlavors, selectedSize, valveBag)
    : 0
  const flavorDisplayPrice = totalPrice * flavorQuantity
  const selectedFlavorDeltaPerKg = selectedFlavors.reduce((sum, flavor) => sum + Number(flavor.price || 0), 0)
  const totalPricePerKg = Number(selectedBase?.price || 0) + selectedFlavorDeltaPerKg
  const flavorPartEn = selectedFlavors.map((flavor) => flavor.nameEn).join(' + ')
  const flavorPartAr = selectedFlavors.map((flavor) => flavor.nameAr).join(' + ')
  const flavorCartItem = selectedBase && selectedFlavors.length > 0 ? {
    id: `flavor-${selectedBase.id}-${selectedFlavors.map((flavor) => flavor.id).join('-')}-${selectedSize}-${valveBag ? 'valve' : 'plain'}`,
    product_id: `custom-flavor-${selectedBase.id}`,
    name_en: `Make Your Flavor - ${selectedBase.nameEn} - ${flavorPartEn}`,
    name_ar: `اصنع نكهتك الخاصة - ${selectedBase.nameAr} - ${flavorPartAr}`,
    size: selectedSize,
    price: totalPrice,
    quantity: flavorQuantity,
    image: getFlavorBaseImage(selectedBase.id),
    customizations: {
      type: 'flavor',
      valve_bag: valveBag,
      base: {
        id: selectedBase.id,
        name_en: selectedBase.nameEn,
        name_ar: selectedBase.nameAr,
        raw_price: selectedBase.price,
      },
      flavors: selectedFlavors.map((flavor) => {
        const availability = getFlavorAvailability(flavor, selectedBase.id)

        return {
          id: flavor.id,
          name_en: flavor.nameEn,
          name_ar: flavor.nameAr,
          type: flavor.type,
          raw_price: flavor.price,
          stock_quantity: availability.stockQuantity ?? null,
          is_manually_out_of_stock: availability.isManuallyOutOfStock === true,
        }
      }),
    },
  } : null
  const flavorStockIssue = flavorCartItem
    ? getCustomStockIssue(items, flavorCartItem, flavorQuantity)
    : null

  const toggleFlavor = (flavor: FlavorAdditionOption) => {
    if (isOptionOutOfStock(getFlavorAvailability(flavor, selectedBase.id))) {
      toast.error(t('This flavor is out of stock', 'هذه النكهة غير متاحة حالياً'))
      return
    }

    setSelectedFlavors((prev) => {
      const exists = prev.some((item) => item.id === flavor.id)
      if (exists) return prev.filter((item) => item.id !== flavor.id)
      if (prev.length >= 3) {
        toast.error(t('Choose up to 3 flavors', 'اختر حتى 3 نكهات فقط'))
        return prev
      }
      return [...prev, flavor]
    })
  }

  useEffect(() => {
    fetch('/api/customization-options', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const nextBases = d?.data?.flavorBases
        const nextAdditions = d?.data?.flavorAdditions

        if (Array.isArray(nextBases) && nextBases.length > 0) {
          const mergedBases = CUSTOMIZE_FLAVOR_BASES.map((base) => {
            const override = nextBases.find((item: FlavorBaseOption) => item.id === base.id)
            return override
              ? {
                  ...base,
                  ...override,
                  descriptionEn: override.descriptionEn || base.descriptionEn,
                  descriptionAr: override.descriptionAr || base.descriptionAr,
                  moodEn: override.moodEn || base.moodEn,
                  moodAr: override.moodAr || base.moodAr,
                }
              : base
          })
          setBaseOptions(mergedBases)
          setSelectedBase((current) => mergedBases.find((base) => base.id === current.id) || mergedBases[0])
        }

        if (Array.isArray(nextAdditions)) {
          const availableAdditions = nextAdditions as FlavorAdditionOption[]
          setAdditionOptions(availableAdditions)
          setSelectedFlavors((current) => current.filter((flavor) =>
            availableAdditions.some((item) =>
              item.id === flavor.id && !isOptionOutOfStock(getFlavorAvailability(item, selectedBase.id))
            )
          ))
        }
      })
      .catch(() => {})
  }, [])

  const handleAdd = () => {
    if (!selectedBase || selectedFlavors.length === 0) {
      toast.error(t('Choose a base and at least one flavor', 'اختر قاعدة ونكهة واحدة على الأقل'))
      return
    }

    if (!flavorCartItem) return

    if (flavorStockIssue) {
      toast.error(t(flavorStockIssue.messageEn, flavorStockIssue.messageAr))
      return
    }

    addItem(flavorCartItem)
    toast.success(t('Added to cart!', 'تمت الإضافة للسلة!'))
    return
  }


  return (
    <PremiumConfiguratorShell
      icon={<Sparkles className="h-7 w-7 text-[#D6A373]" />}
      eyebrow={t('Custom flavor', 'نكهة مخصصة')}
      title={t('Make Your Flavor', 'اصنع نكهتك')}
      description={t(
        'Choose a premium base, then layer up to 3 flavor cards for a polished custom cup.',
        'اختر قاعدة فاخرة ثم أضف حتى 3 بطاقات نكهة لكوب مخصص راق.',
      )}
    >
      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center gap-3">
              <Coffee className="h-5 w-5 text-[#D6A373]" />
              <h3 className="font-serif text-2xl font-bold text-[#F5E6D8]">{t('Choose Your Base', 'اختر القاعدة')}</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {baseOptions.map((base) => {
                const selected = selectedBase.id === base.id
                const previewPrice = calculateFlavorPrice(base.price, [], selectedSize, valveBag)
                return (
                  <PremiumOptionCard
                    key={base.id}
                    title={formatOptionName(language, base)}
                    description={formatOptionDescription(language, base)}
                    meta={`${base.price} ${t('EGP/kg', 'ج.م/كجم')}`}
                    badge={`${t('From', 'من')} ${previewPrice} ${t('EGP', 'ج.م')}`}
                    selected={selected}
                    onClick={() => {
                      setSelectedBase(base)
                      setSelectedFlavors((prev) =>
                        prev.filter((f) => !f.bases || f.bases.includes(base.id))
                      )
                    }}
                  />
                )
              })}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-5 w-5 text-[#D6A373]" />
                  <h3 className="font-serif text-2xl font-bold text-[#F5E6D8]">{t('Choose Flavors', 'اختر النكهات')}</h3>
                </div>
                <p className="mt-1 text-sm text-[#D6B79A]/70">
                  {t('Standard flavor adds 50 EGP/kg. Chunks add 70 EGP/kg.', 'النكهة العادية تضيف 50 ج.م/كجم والقطع تضيف 70 ج.م/كجم.')}
                </p>
              </div>
              <span className="w-fit rounded-full border border-[#B6885E]/18 bg-[#120D09]/70 px-3 py-1 text-xs text-[#D6B79A]">
                {selectedFlavors.length}/3
              </span>
            </div>

            <div className="space-y-5">
              {groupedFilteredAdditions.map(({ group, flavors }) => (
                <div key={group.key}>
                  <h4 className="mb-2 font-serif text-lg font-bold text-[#F5E6D8]">
                    {t(group.nameEn, group.nameAr)}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {flavors.map((flavor) => {
                      const selected = selectedFlavors.some((item) => item.id === flavor.id)
                      const outOfStock = isOptionOutOfStock(getFlavorAvailability(flavor, selectedBase.id))
                      const disabled = outOfStock || (!selected && selectedFlavors.length >= 3)
                      const flavorDescription = formatOptionDescription(language, flavor)
                      return (
                        <PremiumOptionCard
                          key={flavor.id}
                          title={formatOptionName(language, flavor)}
                          description={flavorDescription || t('A premium flavor layer for your custom cup.', 'طبقة نكهة فاخرة لكوبك المخصص.')}
                          meta={`+${flavor.price} ${t('EGP/kg', 'ج.م/كجم')}`}
                          badge={outOfStock
                            ? t('Out of Stock', 'غير متاح')
                            : flavor.type === 'chunks'
                              ? t('Chunks', 'قطع')
                              : t('Flavor', 'نكهة')}
                          selected={selected}
                          disabled={disabled}
                          onClick={() => {
                            if (!outOfStock) toggleFlavor(flavor)
                          }}
                          className="min-h-40"
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <LiveConfiguratorPanel
          eyebrow={t('Live Price', 'السعر المباشر')}
          price={flavorDisplayPrice}
          currency={t('EGP', 'ج.م')}
          note={t('Updates from your base, flavor cards, and selected weight.', 'يتحدث حسب القاعدة وبطاقات النكهة والوزن المختار.')}
        >
            <div>
              <p className="mb-2 text-sm font-semibold text-[#F5E6D8]">{t('Weight', 'الوزن')}</p>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'rounded-xl border px-2 py-3 text-sm font-semibold transition-all duration-200',
                      selectedSize === size ? 'border-[#D6A373]/55 bg-[#D6A373] text-[#0B0806] shadow-[0_0_18px_rgba(182,136,94,0.22)]' : 'border-[#B6885E]/16 bg-[#120D09]/70 text-[#D6B79A] hover:border-[#D6A373]/38 hover:bg-[#B6885E]/8 hover:text-[#F5E6D8]',
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#F5E6D8]">{t('Quantity', 'الكمية')}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setFlavorQuantity((q) => Math.max(1, q - 1))}
                  disabled={flavorQuantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/40 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-base font-semibold text-[#F5E6D8]">{flavorQuantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setFlavorQuantity((q) => q + 1)}
                  disabled={!flavorCartItem}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/40 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#B6885E]/12 bg-[#120D09]/60 p-4">
              <p className="mb-3 text-sm font-semibold text-[#F5E6D8]">
                {t(`Selected Flavors (${selectedFlavors.length})`, `النكهات المختارة (${selectedFlavors.length})`)}
              </p>
              <p className="mb-2.5 text-xs font-medium text-[#D6B79A]/60">
                {t('Base', 'القاعدة')}: <span className="text-[#F5E6D8]/80">{formatOptionName(language, selectedBase)}</span>
              </p>
              {selectedFlavors.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#B6885E]/18 px-3 py-3 text-center text-xs text-[#D6B79A]/50">
                  {t('No flavors selected yet.', 'لم يتم اختيار نكهات بعد.')}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedFlavors.map((flavor) => (
                    <span key={flavor.id} className="rounded-full border border-[#D6A373]/32 bg-[#D6A373]/12 px-2.5 py-1 text-xs font-medium text-[#D6A373]">
                      {formatOptionName(language, flavor)}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 space-y-1 text-xs text-[#D6B79A]/62">
                <div className="flex items-center justify-between gap-3">
                  <span>{t('Base price', 'سعر القاعدة')}</span>
                  <span className="text-[#F5E6D8]/80">{selectedBase.price} {t('EGP/kg', 'ج.م/كجم')}</span>
                </div>
                {selectedFlavors.length > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span>{t('Flavor additions', 'إضافات النكهات')}</span>
                    <span className="text-[#F5E6D8]/80">+{selectedFlavorDeltaPerKg} {t('EGP/kg', 'ج.م/كجم')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-[#B6885E]/10 pt-1">
                  <span>{t('Total per kg', 'الإجمالي للكيلو')}</span>
                  <span className="text-[#D6A373]">{totalPricePerKg} {t('EGP/kg', 'ج.م/كجم')}</span>
                </div>
              </div>
            </div>

            {flavorStockIssue && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {t(flavorStockIssue.messageEn, flavorStockIssue.messageAr)}
              </p>
            )}

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={!selectedBase || selectedFlavors.length === 0 || Boolean(flavorStockIssue)}
              className="premium-button w-full gap-2 rounded-full"
            >
              <ShoppingBag className="h-5 w-5" />
              {t('Add to Cart', 'أضف للسلة')}
            </Button>
        </LiveConfiguratorPanel>
      </div>
    </PremiumConfiguratorShell>
  )
}


// ─── Main Page ─────────────────────────────────────────────────────────────────
function ProductsPageInner() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(() => {
    const requestedCategory = normalizeCategorySlug(searchParams.get('category') || DEFAULT_CATEGORY_SLUG)
    return requestedCategory === 'all' ? DEFAULT_CATEGORY_SLUG : requestedCategory
  })
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([])
  const [productsBanner, setProductsBanner] = useState<SiteMediaItem | null>(null)

  // Fetch categories from DB; fall back to hardcoded if DB is empty or unreachable
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length > 0) setDbCategories(d.data)
        else setDbCategories(FALLBACK_DB_CATEGORIES)
      })
      .catch(() => setDbCategories(FALLBACK_DB_CATEGORIES))
  }, [])

  useEffect(() => {
    let mounted = true

    fetch('/api/media?section_key=products_banner', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (mounted && Array.isArray(json?.data) && json.data[0]?.image_url) {
          setProductsBanner(json.data[0])
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  // Fetch products from API first; use fallback only as a last-resort recovery path.
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const loadProducts = async () => {
      setProductsLoading(true)

      try {
        const response = await fetch('/api/products?limit=300', {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Products API failed')

        const data = await response.json()
        if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('Products API returned no products')
        }

        if (!cancelled) setProducts(data.data)
      } catch (error) {
        if (cancelled || (error instanceof Error && error.name === 'AbortError')) return
        setProducts(OFFICIAL_LAST_RESORT_PRODUCTS)
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }

    loadProducts()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  // Build sidebar categories from DB, injecting special UI entries
  const sidebarCategories = useMemo<SidebarCategory[]>(() => {
    const mainCats = OFFICIAL_PRODUCT_CATEGORIES.map((category) => ({
      slug: category.slug,
      nameEn: category.name_en,
      nameAr: category.name_ar,
      isCustomizeBlend: category.slug === 'build-your-espresso',
    }))
    return [...mainCats, CUSTOMIZE_FLAVOR_ENTRY]
  }, [])

  const currentCat = sidebarCategories.find((c) => c.slug === activeCategory)
  const isCustomizeBlend = currentCat?.isCustomizeBlend
  const isCustomizeFlavor = currentCat?.isCustomizeFlavor
  const isCustomize = isCustomizeBlend || isCustomizeFlavor

  const categorySlugById = useMemo(() => {
    const map = new Map<string, string>()
    dbCategories.forEach((category) => {
      const normalizedSlug = normalizeCategorySlug(category.slug)
      map.set(category.id, normalizedSlug)
      map.set(category.slug, normalizedSlug)
    })
    return map
  }, [dbCategories])

  const filteredProducts = useMemo(() => {
    if (isCustomize) return []
    const officialFixedProducts = OFFICIAL_LAST_RESORT_PRODUCTS.filter((product) =>
      FIXED_OFFICIAL_CATEGORY_SLUGS.has(normalizeCategorySlug(product.category_id))
    )
    const officialProductsForCategory = (slug: string) =>
      OFFICIAL_LAST_RESORT_PRODUCTS.filter((product) => normalizeCategorySlug(product.category_id) === slug)
    const getProductCategorySlug = (product: Product) =>
      normalizeCategorySlug(
        product.category?.slug ??
          (product.category_id ? categorySlugById.get(product.category_id) : undefined) ??
          product.category_id
      )
    const apiProducts = products.filter((product) => !FIXED_OFFICIAL_CATEGORY_SLUGS.has(getProductCategorySlug(product)))
    const catalogProducts = [...apiProducts, ...officialFixedProducts].filter((product) => {
      const categorySlug = getProductCategorySlug(product)
      return !(NO_CHUNK_PRODUCT_CATEGORY_SLUGS.has(categorySlug) && isChunkProduct(product))
    })

    FALLBACK_WHEN_EMPTY_CATEGORY_SLUGS.forEach((slug) => {
      if (!catalogProducts.some((product) => getProductCategorySlug(product) === slug)) {
        catalogProducts.push(...officialProductsForCategory(slug))
      }
    })

    let nextProducts = [...catalogProducts]

    if (searchQuery.trim()) {
      // Product-page search spans visible catalog entries because the sidebar starts at Turkish Blends.
    } else if (FIXED_OFFICIAL_CATEGORY_SLUGS.has(activeCategory)) {
      nextProducts = officialFixedProducts.filter(
        (product) => normalizeCategorySlug(product.category_id) === activeCategory
      )
    } else {
      nextProducts = nextProducts.filter((product) => {
        return getProductCategorySlug(product) === activeCategory
      })

      if (nextProducts.length === 0 && FALLBACK_WHEN_EMPTY_CATEGORY_SLUGS.has(activeCategory)) {
        nextProducts = officialProductsForCategory(activeCategory)
      }
    }

    // Classic / Original always sorts first within a category
    nextProducts.sort((a, b) => {
      const aFirst = /classic|original/i.test(a.name_en) ? 0 : 1
      const bFirst = /classic|original/i.test(b.name_en) ? 0 : 1
      return aFirst - bFirst
    })

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      nextProducts = nextProducts.filter((product) => product.name_en.toLowerCase().includes(q) || product.name_ar.includes(searchQuery))
    }

    return nextProducts
  }, [activeCategory, searchQuery, isCustomize, products, categorySlugById])
  const isFixedOfficialCategory = FIXED_OFFICIAL_CATEGORY_SLUGS.has(activeCategory)

  const handleCategoryChange = (slug: string) => {
    const normalizedSlug = normalizeCategorySlug(slug) === 'all' ? DEFAULT_CATEGORY_SLUG : normalizeCategorySlug(slug)
    setActiveCategory(normalizedSlug)
    router.push(`/products?category=${normalizedSlug}`, { scroll: false })
  }

  const handleEmptyStateReset = () => {
    setSearchQuery('')
    handleCategoryChange(DEFAULT_CATEGORY_SLUG)
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B0806' }}>
      {/* Hero Banner */}
      <div className="relative h-[45vh] min-h-[320px] flex items-center justify-center -mt-20 md:-mt-24 pt-20 md:pt-24" style={{ background: '#0B0806' }}>
        <Image
          src={productsBanner?.image_url || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600'}
          alt={language === 'ar' ? productsBanner?.alt_ar || productsBanner?.alt_en || 'Our Products' : productsBanner?.alt_en || productsBanner?.alt_ar || 'Our Products'}
          fill
          className="object-cover brightness-[0.58] contrast-[1.14] saturate-[1.08]"
          style={{ objectPosition: productsBanner ? getMediaObjectPosition(productsBanner) : 'center center' }}
          priority
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: productsBanner ? getMediaOverlayOpacity(productsBanner, 0.6) : 0.6 }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.08)_0%,_transparent_70%)]" />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1 initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t(productsBanner?.title_en || 'Our Products', productsBanner?.title_ar || productsBanner?.title_en || 'منتجاتنا')}
          </motion.h1>
          <motion.p initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            {t(
              productsBanner?.subtitle_en || 'Discover our carefully curated selection of premium coffee.',
              productsBanner?.subtitle_ar || productsBanner?.subtitle_en || 'اكتشف مجموعتنا المنتقاة من القهوة الفاخرة.',
            )}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="luxury-panel sticky top-28 rounded-2xl p-4">
              <h2 className="font-serif text-lg font-semibold mb-4 px-2">{t('Categories', 'الفئات')}</h2>
              <nav className="space-y-1">
                {sidebarCategories.map((cat) => (
                  <button type="button" key={cat.slug} onClick={() => handleCategoryChange(cat.slug)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 border',
                      activeCategory === cat.slug ? 'font-medium scale-[1.02] border-[#D6A373]/30' : 'border-transparent text-[#D6B79A]/75 hover:border-[#B6885E]/20 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8] hover:scale-[1.01]',
                      (cat.isCustomizeBlend || cat.isCustomizeFlavor) && 'border-2 border-dashed border-primary/30'
                    )}
                    style={activeCategory === cat.slug ? {
                      background: 'linear-gradient(135deg, #B6885E 0%, #D6A373 100%)',
                      color: '#0B0806',
                      boxShadow: '0 4px 16px rgba(182,136,94,0.3)',
                    } : undefined}>
                    {(cat.isCustomizeBlend || cat.isCustomizeFlavor) && <Sparkles className="w-4 h-4 shrink-0" />}
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                    {activeCategory === cat.slug && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            {isCustomizeBlend ? (
              <MakeYourEspressoBlend />
            ) : isCustomizeFlavor ? (
              <CustomizeFlavor />
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="text" placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-[#B6885E]/20 bg-[#120D09]/70 pl-10 text-[#F5E6D8] placeholder:text-[#B79B85]/50 focus-visible:ring-[#B6885E]/30" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">{t(`Showing ${filteredProducts.length} products`, `عرض ${filteredProducts.length} منتج`)}</p>
                </div>

                {productsLoading && !isFixedOfficialCategory ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="luxury-card overflow-hidden rounded-xl border border-[#B6885E]/[16%] bg-[#120D09]/70">
                        <div className="h-32 animate-pulse bg-[#2A1810]/60 min-[380px]:h-36 sm:h-40 lg:h-44" />
                        <div className="space-y-3 p-3 sm:p-4">
                          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#2A1810]/70" />
                          <div className="h-3 w-full animate-pulse rounded-full bg-[#2A1810]/50" />
                          <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#2A1810]/50" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <PackageSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="font-serif text-xl font-semibold mb-2">{t('No products found', 'لم يتم العثور على منتجات')}</h3>
                    <Button onClick={handleEmptyStateReset}>{t('Back to Turkish Blends', 'الرجوع إلى توليفات تركي')}</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ background: '#0B0806' }}>
        <div className="relative h-[45vh] min-h-[320px] flex items-center justify-center -mt-20 md:-mt-24" style={{ background: '#0F0A07' }}>
          <div className="container mx-auto px-4 text-center">
            <div className="h-10 w-56 rounded-lg mx-auto" style={{ background: 'rgba(182,136,94,0.1)' }} />
          </div>
        </div>
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  )
}
