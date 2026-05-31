'use client'

import type { ReactNode } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PremiumConfiguratorShell({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="luxury-panel overflow-hidden rounded-2xl">
      <div className="border-b border-[#B6885E]/15 p-5 sm:p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#B6885E]/12 ring-1 ring-[#B6885E]/20">
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D6A373]/75">{eyebrow}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#F5E6D8] md:text-4xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#D6B79A]/75">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

export function PremiumOptionCard({
  title,
  description,
  meta,
  badge,
  selected,
  disabled,
  onClick,
  children,
  className,
}: {
  title: string
  description?: string
  meta?: string
  badge?: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  children?: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative min-h-36 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300',
        'bg-gradient-to-br from-[#1B140F]/95 via-[#120D09]/92 to-[#0B0806]/95',
        disabled
          ? 'cursor-not-allowed border-[#B6885E]/8 opacity-45 grayscale'
          : selected
            ? 'border-[#D6A373]/55 shadow-[0_0_38px_rgba(182,136,94,0.18)]'
            : 'border-[#B6885E]/16 hover:-translate-y-1 hover:border-[#D6A373]/38 hover:bg-[#B6885E]/5',
        className,
      )}
    >
      <div className="pointer-events-none absolute right-5 top-4 h-20 w-20 rounded-full bg-[#B6885E]/12 opacity-70 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-serif text-xl font-bold leading-tight text-[#F5E6D8]">{title}</h4>
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                selected ? 'border-[#D6A373] bg-[#D6A373] text-[#0B0806]' : 'border-[#B6885E]/30 text-[#D6A373]',
              )}
            >
              {selected ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          </div>
          {description && <p className="mt-3 text-sm leading-relaxed text-[#D6B79A]/76">{description}</p>}
        </div>
        <div className="space-y-3">
          {(meta || badge) && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {meta && <span className="text-[#D6A373]">{meta}</span>}
              {badge && (
                <span className="rounded-full border border-[#B6885E]/18 bg-[#B6885E]/10 px-2.5 py-1 font-medium text-[#F5E6D8]/72">
                  {badge}
                </span>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </button>
  )
}

export function IndicatorBar({
  label,
  value,
  max = 5,
}: {
  label: string
  value: number
  max?: number
}) {
  const width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-medium text-[#D6B79A]/62">
        <span>{label}</span>
        <span className="text-[#D6A373]">{value}/{max}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#B6885E]/12">
        <div className="h-full rounded-full bg-[#D6A373] transition-all duration-500 ease-out" style={{ width }} />
      </div>
    </div>
  )
}

export function LiveConfiguratorPanel({
  eyebrow,
  price,
  currency,
  note,
  children,
}: {
  eyebrow: string
  price: number
  currency: string
  note: string
  children: ReactNode
}) {
  return (
    <aside className="h-fit rounded-2xl border border-[#B6885E]/18 bg-[#0B0806]/78 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] lg:sticky lg:top-28">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D6A373]/75">{eyebrow}</p>
        <p className="mt-2 font-serif text-4xl font-bold text-[#D6A373] transition-all duration-300">
          {price} {currency}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#D6B79A]/58">{note}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </aside>
  )
}
