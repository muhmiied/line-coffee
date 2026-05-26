'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/context/auth'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  Star,
  Percent,
  FileText,
  Image as ImageIcon,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Globe,
  Coffee,
  Sparkles,
  MessageSquare,
} from 'lucide-react'

const nav = [
  { href: '/dashboard/admin',              labelEn: 'Dashboard',     labelAr: 'نظرة عامة',       icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/orders',       labelEn: 'Orders',        labelAr: 'الطلبات',          icon: Package },
  { href: '/dashboard/admin/products',     labelEn: 'Products',      labelAr: 'المنتجات',         icon: ShoppingBag },
  { href: '/dashboard/admin/categories',   labelEn: 'Categories',    labelAr: 'الفئات',           icon: Tag },
  { href: '/dashboard/admin/coffee-beans', labelEn: 'Coffee Beans',  labelAr: 'أنواع القهوة',     icon: Coffee },
  { href: '/dashboard/admin/flavors',      labelEn: 'Flavors',       labelAr: 'النكهات',          icon: Sparkles },
  { href: '/dashboard/admin/customers',    labelEn: 'Customers',     labelAr: 'العملاء',          icon: Users },
  { href: '/dashboard/admin/contact-messages', labelEn: 'Contact',   labelAr: 'رسائل التواصل',    icon: MessageSquare },
  { href: '/dashboard/admin/reviews',      labelEn: 'Reviews',       labelAr: 'المراجعات',        icon: Star },
  { href: '/dashboard/admin/discounts',    labelEn: 'Discounts',     labelAr: 'الخصومات',         icon: Percent },
  { href: '/dashboard/admin/blog',         labelEn: 'Blog',          labelAr: 'المدونة',          icon: FileText },
  { href: '/dashboard/admin/banners',      labelEn: 'Media',         labelAr: 'الوسائط',          icon: ImageIcon },
  { href: '/dashboard/admin/settings',     labelEn: 'Settings',      labelAr: 'الإعدادات',        icon: Settings },
]

const pageTitles: Record<string, { en: string; ar: string }> = {
  '/dashboard/admin':              { en: 'Overview',      ar: 'نظرة عامة' },
  '/dashboard/admin/orders':       { en: 'Orders',        ar: 'الطلبات' },
  '/dashboard/admin/products':     { en: 'Products',      ar: 'المنتجات' },
  '/dashboard/admin/categories':   { en: 'Categories',    ar: 'الفئات' },
  '/dashboard/admin/coffee-beans': { en: 'Coffee Beans',  ar: 'أنواع القهوة' },
  '/dashboard/admin/flavors':      { en: 'Flavors',       ar: 'النكهات' },
  '/dashboard/admin/customers':    { en: 'Customers',     ar: 'العملاء' },
  '/dashboard/admin/contact-messages': { en: 'Contact Messages', ar: 'رسائل التواصل' },
  '/dashboard/admin/reviews':      { en: 'Reviews',       ar: 'المراجعات' },
  '/dashboard/admin/discounts':    { en: 'Discounts',     ar: 'الخصومات' },
  '/dashboard/admin/blog':         { en: 'Blog',          ar: 'المدونة' },
  '/dashboard/admin/banners':      { en: 'Media Manager', ar: 'مدير الوسائط' },
  '/dashboard/admin/settings':     { en: 'Settings',      ar: 'الإعدادات' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [pendingOrdersList, setPendingOrdersList] = useState<Array<{
    id: string
    order_number: string
    total: number
    created_at: string
    shipping_address: { first_name?: string; last_name?: string } | null
  }>>([])

  // Fetch pending order count for notification badge
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' })
      const json = await res.json()
      const orders: Array<{ id: string; status: string; order_number: string; total: number; created_at: string; shipping_address: { first_name?: string; last_name?: string } | null }> = json?.data?.orders || []
      const pending = orders.filter(o => o.status === 'pending')
      setPendingOrders(pending.length)
      setPendingOrdersList(pending.slice(0, 5))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchPendingCount()
    // Re-check every 60 seconds
    const interval = setInterval(fetchPendingCount, 60_000)
    return () => clearInterval(interval)
  }, [fetchPendingCount])

  useEffect(() => {
    document.documentElement.style.backgroundColor = '#0f0900'
    document.documentElement.style.colorScheme = 'dark'
    return () => {
      document.documentElement.style.backgroundColor = ''
      document.documentElement.style.colorScheme = ''
    }
  }, [])

  const displayName =
    user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin'
  const initial = displayName.charAt(0).toUpperCase()
  const email = user?.email || ''

  const pageTitle = pageTitles[pathname]
    ? t(pageTitles[pathname].en, pageTitles[pathname].ar)
    : t('Dashboard', 'لوحة التحكم')

  return (
    <div className="relative flex -mt-20 min-h-[100dvh] overflow-hidden bg-[#0B0806] md:-mt-24">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_22%_0%,_rgba(214,163,115,0.10),_transparent_62%),linear-gradient(180deg,_rgba(82,37,0,0.14),_transparent_34%)]" />

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 z-50 hidden h-[100dvh] w-[215px] select-none flex-col border-r border-[#D6A373]/12 bg-[#080503]/96 shadow-[18px_0_80px_rgba(0,0,0,0.35)] backdrop-blur md:flex">
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D6A373]/22 to-transparent" />

        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <Link href="/" className="block">
            <Image
              src="/brand/logo-white.svg"
              alt="Line Coffee"
              width={150}
              height={66}
              className="object-contain object-left"
              unoptimized
            />
          </Link>
          <p className="text-white/20 text-[9px] tracking-widest uppercase mt-2">
            {t('Admin Panel', 'لوحة الإدارة')}
          </p>
        </div>

        <div className="mx-5 h-px bg-[#D6A373]/12" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            const isOrders = item.href === '/dashboard/admin/orders'
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                  active
                    ? 'border border-[#D6A373]/28 bg-gradient-to-r from-[#D6A373]/18 to-[#522500]/18 text-[#D6A373] shadow-[0_10px_30px_rgba(214,163,115,0.08)]'
                    : 'text-white/38 hover:bg-white/[0.045] hover:text-[#F5E6D8]'
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    active ? 'text-[#D6A373]' : 'text-white/25 group-hover:text-[#D6A373]/70'
                  )}
                />
                <span className="flex-1">{t(item.labelEn, item.labelAr)}</span>
                {isOrders && pendingOrders > 0 && (
                  <span className="ml-auto h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingOrders > 99 ? '99+' : pendingOrders}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

      </aside>

      {/* ── Content ── */}
      <div className="relative z-10 flex min-h-[100dvh] min-w-0 flex-1 flex-col md:ml-[215px]">

        {/* Top bar */}
        <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-[#D6A373]/14 bg-[#080503]/88 px-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-4 md:left-[215px] md:px-6">
          {pathname === '/dashboard/admin' ? (
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold leading-none text-white sm:text-base">
                {t('Welcome back', 'مرحباً بعودتك')} 👋
              </h1>
              <p className="mt-0.5 hidden text-[11px] text-white/30 sm:block">
                {t("Here's what's happening with your store today.", 'إليك ملخص أداء متجرك اليوم')}
              </p>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <h1 className="truncate text-sm font-bold text-white/90 sm:text-base">{pageTitle}</h1>
              {pathname === '/dashboard/admin/orders' && pendingOrders > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold">
                  {pendingOrders} {t('pending', 'معلق')}
                </span>
              )}
            </div>
          )}

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
              <input
                type="text"
                placeholder={t('Search anything...', 'ابحث عن أي شيء...')}
                className="w-44 bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
              />
            </div>

            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-[#c8941a] hover:border-[#c8941a]/20 text-xs font-bold transition-all"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>

            {/* Bell dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBellOpen(v => !v)}
                aria-label={t('Notifications', 'الإشعارات')}
                className="relative h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-[#c8941a]/20 transition-all"
              >
                <Bell className="h-4 w-4" />
                {pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingOrders > 9 ? '9+' : pendingOrders}
                  </span>
                )}
              </button>

              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setBellOpen(false)} />
                  <div className="fixed inset-x-3 top-[4.5rem] z-[60] max-h-[calc(100dvh-5.5rem)] overflow-hidden rounded-xl border border-[#c8941a]/15 bg-[#0a0500] shadow-2xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-72">
                    <div className="px-4 py-3 border-b border-[#c8941a]/10 flex items-center justify-between">
                      <p className="text-white/80 text-xs font-semibold">{t('Pending Orders', 'الطلبات المعلقة')}</p>
                      {pendingOrders > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold">{pendingOrders}</span>
                      )}
                    </div>
                    {pendingOrdersList.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="h-6 w-6 mx-auto mb-2 text-white/10" />
                        <p className="text-white/25 text-xs">{t('No pending orders', 'لا توجد طلبات معلقة')}</p>
                      </div>
                    ) : (
                      <div className="max-h-[calc(100dvh-14rem)] divide-y divide-white/[0.03] overflow-y-auto md:max-h-80">
                        {pendingOrdersList.map(order => (
                          <Link
                            key={order.id}
                            href="/dashboard/admin/orders"
                            onClick={() => setBellOpen(false)}
                            className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
                          >
                            <div>
                              <p className="text-white/80 text-xs font-semibold">#{order.order_number}</p>
                              <p className="text-white/30 text-[10px] mt-0.5">
                                {order.shipping_address?.first_name || '—'} · {new Date(order.created_at).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                            <span className="text-[#c8941a] text-[11px] font-bold shrink-0 ml-3">{Number(order.total).toLocaleString()} EGP</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="px-4 py-3 border-t border-[#c8941a]/10">
                      <Link
                        href="/dashboard/admin/orders"
                        onClick={() => setBellOpen(false)}
                        className="flex items-center justify-center text-[#c8941a] text-xs font-semibold hover:opacity-70 transition-opacity"
                      >
                        {t('View All Orders', 'عرض جميع الطلبات')} →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings */}
            <Link
              href="/dashboard/admin/settings"
              className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-[#c8941a]/20 transition-all"
            >
              <Settings className="h-4 w-4" />
            </Link>

            {/* Avatar dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAvatarOpen((v) => !v)}
                className="flex items-center gap-1.5 h-9 px-1 rounded-xl hover:bg-white/[0.04] transition-all"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#c8941a]/40 to-[#c8941a]/15 border border-[#c8941a]/30 flex items-center justify-center">
                  <span className="text-[#c8941a] font-bold text-xs">{initial}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-white/30" />
              </button>

              {avatarOpen && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setAvatarOpen(false)} />
                  <div className="fixed right-3 top-[4.5rem] z-[60] w-48 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-[#c8941a]/15 bg-[#0a0500] shadow-2xl md:absolute md:right-0 md:top-full md:mt-2">
                    <div className="px-4 py-3 border-b border-[#c8941a]/10">
                      <p className="text-white/80 text-xs font-semibold truncate">{displayName}</p>
                      <p className="text-white/30 text-[10px] truncate mt-0.5">{email}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.04] text-xs transition-all"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        {t('Dashboard', 'لوحة التحكم')}
                      </Link>
                      <Link
                        href="/"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.04] text-xs transition-all"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        {t('View Store', 'عرض الموقع')}
                      </Link>
                      <div className="h-px bg-[#c8941a]/10 my-1" />
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-xs transition-all"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        {t('Sign Out', 'تسجيل الخروج')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-[linear-gradient(180deg,#120D09_0%,#0B0806_36%,#0f0900_100%)] pt-16">
          <nav className="sticky top-16 z-30 flex gap-2 overflow-x-auto border-b border-[#c8941a]/10 bg-[#0a0500]/96 px-3 py-2 md:hidden">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)
              const isOrders = item.href === '/dashboard/admin/orders'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium transition-colors',
                    active
                      ? 'border-[#c8941a]/25 bg-[#c8941a]/15 text-[#c8941a]'
                      : 'border-white/[0.06] bg-white/[0.03] text-white/45 hover:text-white/75'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{t(item.labelEn, item.labelAr)}</span>
                  {isOrders && pendingOrders > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {pendingOrders > 9 ? '9+' : pendingOrders}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
