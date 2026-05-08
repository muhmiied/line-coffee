'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useLanguage } from '@/lib/context/language'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductsFiltersProps {
  categories: Category[]
  currentCategory?: string
  currentRoast?: string
  currentSort?: string
}

const roastLevels = [
  { value: 'light', labelEn: 'Light Roast', labelAr: 'تحميص خفيف' },
  { value: 'medium', labelEn: 'Medium Roast', labelAr: 'تحميص متوسط' },
  { value: 'dark', labelEn: 'Dark Roast', labelAr: 'تحميص داكن' },
  { value: 'espresso', labelEn: 'Espresso Roast', labelAr: 'تحميص إسبريسو' },
]

const sortOptions = [
  { value: 'featured', labelEn: 'Featured', labelAr: 'مميز' },
  { value: 'newest', labelEn: 'Newest', labelAr: 'الأحدث' },
  { value: 'popular', labelEn: 'Most Popular', labelAr: 'الأكثر شعبية' },
  { value: 'price-asc', labelEn: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
  { value: 'price-desc', labelEn: 'Price: High to Low', labelAr: 'السعر: من الأعلى للأقل' },
]

export function ProductsFilters({
  categories,
  currentCategory,
  currentRoast,
  currentSort,
}: ProductsFiltersProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (name: string, value: string | null) => {
    router.push(`/products?${createQueryString(name, value)}`)
  }

  const clearAllFilters = () => {
    router.push('/products')
  }

  const hasActiveFilters = currentCategory || currentRoast

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">{t('Filters', 'الفلاتر')}</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            {t('Clear', 'مسح')}
          </Button>
        )}
      </div>

      {/* Sort - Mobile */}
      <div className="lg:hidden">
        <Label className="text-sm font-medium mb-2 block">
          {t('Sort By', 'ترتيب حسب')}
        </Label>
        <Select
          value={currentSort || 'featured'}
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelEn, option.labelAr)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-medium">{t('Category', 'الفئة')}</span>
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={currentCategory || ''}
              onValueChange={(value) => updateFilter('category', value || null)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="category-all" />
                <Label
                  htmlFor="category-all"
                  className={cn(
                    'cursor-pointer',
                    !currentCategory && 'font-medium text-primary'
                  )}
                >
                  {t('All Categories', 'جميع الفئات')}
                </Label>
              </div>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={category.slug} id={`category-${category.slug}`} />
                  <Label
                    htmlFor={`category-${category.slug}`}
                    className={cn(
                      'cursor-pointer',
                      currentCategory === category.slug && 'font-medium text-primary'
                    )}
                  >
                    {language === 'ar' ? category.name_ar : category.name_en}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Roast Level */}
      <Accordion type="single" collapsible defaultValue="roast">
        <AccordionItem value="roast" className="border-none">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-medium">{t('Roast Level', 'درجة التحميص')}</span>
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={currentRoast || ''}
              onValueChange={(value) => updateFilter('roast', value || null)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="roast-all" />
                <Label
                  htmlFor="roast-all"
                  className={cn(
                    'cursor-pointer',
                    !currentRoast && 'font-medium text-primary'
                  )}
                >
                  {t('All Roasts', 'جميع درجات التحميص')}
                </Label>
              </div>
              {roastLevels.map((roast) => (
                <div key={roast.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={roast.value} id={`roast-${roast.value}`} />
                  <Label
                    htmlFor={`roast-${roast.value}`}
                    className={cn(
                      'cursor-pointer',
                      currentRoast === roast.value && 'font-medium text-primary'
                    )}
                  >
                    {t(roast.labelEn, roast.labelAr)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Sort - Desktop */}
      <div className="hidden lg:block">
        <Accordion type="single" collapsible defaultValue="sort">
          <AccordionItem value="sort" className="border-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="font-medium">{t('Sort By', 'ترتيب حسب')}</span>
            </AccordionTrigger>
            <AccordionContent>
              <RadioGroup
                value={currentSort || 'featured'}
                onValueChange={(value) => updateFilter('sort', value)}
                className="space-y-2"
              >
                {sortOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                    <Label
                      htmlFor={`sort-${option.value}`}
                      className={cn(
                        'cursor-pointer',
                        (currentSort || 'featured') === option.value && 'font-medium text-primary'
                      )}
                    >
                      {t(option.labelEn, option.labelAr)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
