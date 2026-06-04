'use client'

import { FileText } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'

export function BlogEmptyState() {
  const { t } = useLanguage()

  return (
    <div className="py-24 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#B6885E]/15 bg-[#B6885E]/8">
        <FileText className="h-9 w-9 text-[#B6885E]/55" />
      </div>
      <h2 className="mb-2 font-serif text-xl font-semibold text-[#F5E6D8]">{t('Coffee notes are being prepared', 'نحضر ملاحظات القهوة')}</h2>
      <p className="mx-auto max-w-md text-[#D6B79A]/60">
        {t(
          'Guides, Line Coffee updates, and brewing notes will appear here once published.',
          'ستظهر هنا الإرشادات وتحديثات لاين كوفي وملاحظات التحضير بعد نشرها.',
        )}
      </p>
    </div>
  )
}
