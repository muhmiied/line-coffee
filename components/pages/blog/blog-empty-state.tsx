'use client'

import { FileText } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'

type BlogEmptyStateProps = {
  previewOverrides?: {
    title?: string
    body?: string
  }
}

export function BlogEmptyState({ previewOverrides }: BlogEmptyStateProps) {
  const { t } = useLanguage()
  const titleEn = previewOverrides?.title ?? 'Coffee notes are being prepared'
  const titleAr = previewOverrides?.title ?? 'نحضر ملاحظات القهوة'
  const bodyEn = previewOverrides?.body ?? 'Guides, Line Coffee updates, and brewing notes will appear here once published.'
  const bodyAr = previewOverrides?.body ?? 'ستظهر هنا الإرشادات وتحديثات لاين كوفي وملاحظات التحضير بعد نشرها.'

  return (
    <div className="py-24 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#B6885E]/15 bg-[#B6885E]/8">
        <FileText className="h-9 w-9 text-[#B6885E]/55" />
      </div>
      <h2 className="mb-2 font-serif text-xl font-semibold text-[#F5E6D8]">{t(titleEn, titleAr)}</h2>
      <p className="mx-auto max-w-md text-[#D6B79A]/60">
        {t(bodyEn, bodyAr)}
      </p>
    </div>
  )
}
