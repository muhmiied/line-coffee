'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  BarChart2,
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
} from 'lucide-react'

const nav = [
  { href: '/dashboard/admin',            labelEn: 'Dashboard',   labelAr: 'نظرة عامة',       icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/orders',     labelEn: 'Orders',      labelAr: 'الطلبات',          icon: Package },
  { href: '/dashboard/admin/products',   labelEn: 'Products',    labelAr: 'المنتجات',         icon: ShoppingBag },
  { href: '/dashboard/admin/categories', labelEn: 'Categories',  labelAr: 'الفئات',           icon: Tag },
  { href: '/dashboard/admin/customers',  labelEn: 'Customers',   labelAr: 'العملاء',          icon: Users },
  { href: '/dashboard/admin/analytics',  labelEn: 'Analytics',   labelAr: 'التحليلات',        icon: BarChart2 },
  { href: '/dashboard/admin/reviews',    labelEn: 'Reviews',     labelAr: 'المراجعات',        icon: Star },
  { href: '/dashboard/admin/discounts',  labelEn: 'Discounts',   labelAr: 'الخصومات',         icon: Percent },
  { href: '/dashboard/admin/blog',       labelEn: 'Blog',        labelAr: 'المدونة',          icon: FileText },
  { href: '/dashboard/admin/banners',    labelEn: 'Banners',     labelAr: 'البانرات',         icon: ImageIcon },
  { href: '/dashboard/admin/settings',   labelEn: 'Settings',    labelAr: 'الإعدادات',        icon: Settings },
]

const pageTitles: Record<string, { en: string; ar: string }> = {
  '/dashboard/admin':            { en: 'Overview',    ar: 'نظرة عامة' },
  '/dashboard/admin/orders':     { en: 'Orders',      ar: 'الطلبات' },
  '/dashboard/admin/products':   { en: 'Products',    ar: 'المنتجات' },
  '/dashboard/admin/categories': { en: 'Categories',  ar: 'الفئات' },
  '/dashboard/admin/customers':  { en: 'Customers',   ar: 'العملاء' },
  '/dashboard/admin/analytics':  { en: 'Analytics',   ar: 'التحليلات' },
  '/dashboard/admin/reviews':    { en: 'Reviews',     ar: 'المراجعات' },
  '/dashboard/admin/discounts':  { en: 'Discounts',   ar: 'الخصومات' },
  '/dashboard/admin/blog':       { en: 'Blog',        ar: 'المدونة' },
  '/dashboard/admin/banners':    { en: 'Banners',     ar: 'البانرات' },
  '/dashboard/admin/settings':   { en: 'Settings',    ar: 'الإعدادات' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const [avatarOpen, setAvatarOpen] = useState(false)

  useEffect(() => {
    document.documentElement.style.backgroundColor = '#0f0900'
    document.documentElement.style.colorScheme = 'dark'
    return () => {
      document.documentElement.style.backgroundColor = ''
      document.documentElement.style.colorScheme = ''
    }
  }, [])

  const displayName =
    user?.user_metadata?.first_name ||
    user?.email?.split('@')[0] ||
    'Admin'
  const initial = displayName.charAt(0).toUpperCase()
  const email = user?.email || ''

  const pageTitle = pageTitles[pathname]
    ? t(pageTitles[pathname].en, pageTitles[pathname].ar)
    : t('Dashboard', 'لوحة التحكم')

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex -mt-20 md:-mt-24 min-h-[100dvh] bg-[#0f0900]">

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-[100dvh] w-[215px] bg-[#0a0500] flex flex-col z-50 select-none">
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c8941a]/10 to-transparent" />

        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <Link href="/" className="block">
            <Image
              src="/brand/logo-white.svg"
              alt="Line Coffee"
              width={130}
              height={40}
              className="object-contain object-left"
              unoptimized
            />
          </Link>
          <p className="text-white/20 text-[9px] tracking-widest uppercase mt-2">
            {t('Admin Panel', 'لوحة الإدارة')}
          </p>
        </div>

        <div className="mx-5 h-px bg-[#c8941a]/10" />

        {/* User card */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-[#c8941a]/10">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#c8941a]/30 to-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center shrink-0">
              <span className="text-[#c8941a] font-bold text-xs">{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white/75 text-xs font-semibold truncate">{displayName}</p>
              <p className="text-white/25 text-[10px] mt-0.5">{t('System Admin', 'مدير النظام')}</p>
            </div>
          </div>
        </div>

        <div className="mx-5 h-px bg-[#c8941a]/10" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                  active
                    ? 'bg-[#c8941a]/15 text-[#c8941a] border border-[#c8941a]/20'
                    : 'text-white/35 hover:text-white/70 hover:bg-white/[0.04]'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#c8941a]' : 'text-white/25 group-hover:text-white/55')} />
                {t(item.labelEn, item.labelAr)}
              </Link>
            )
          })}
        </nav>

        {/* Promo card */}
        <div className="px-4 pb-3">
          <div className="relative rounded-xl overflow-hidden border border-[#c8941a]/15">
            <div className="absolute inset-0 bg-gradient-to-b from-[#3a1800] to-[#0a0500]" />
            <div className="relative p-4">
              <p className="text-white/80 text-[11px] font-bold leading-snug">Brew Inspiration</p>
              <p className="text-[#c8941a]/60 text-[10px] mt-0.5 mb-3">Deliver Happiness</p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 bg-[#c8941a]/15 hover:bg-[#c8941a]/25 border border-[#c8941a]/20 text-[#c8941a] text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Globe className="h-3 w-3" />
                {t('View Store', 'عرض الموقع')} →
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-5 h-px bg-[#c8941a]/10" />

        {/* Bottom user + logout */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#c8941a]/30 to-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center shrink-0">
              <span className="text-[#c8941a] font-bold text-[10px]">{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white/60 text-[11px] font-medium truncate">{displayName}</p>
              <p className="text-white/20 text-[9px] truncate">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t('Sign Out', 'تسجيل الخروج')}
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 ml-[215px] min-h-[100dvh] flex flex-col">

        {/* Top bar */}
        <header className="fixed top-0 right-0 left-[215px] h-16 bg-[#0a0500]/95 backdrop-blur-sm border-b border-[#c8941a]/8 z-40 flex items-center justify-between px-6">
          {pathname === '/dashboard/admin' ? (
            <div>
              <h1 className="text-white font-bold text-base leading-none">
                {t('Welcome back,', 'مرحباً بعودتك،')} {displayName} 👋
              </h1>
              <p className="text-white/30 text-[11px] mt-0.5">
                {t("Here's what's happening with your store today.", 'إليك ملخص أداء متجرك اليوم')}
              </p>
            </div>
          ) : (
            <h1 className="text-white/90 font-bold text-base">{pageTitle}</h1>
          )}

          <div className="flex items-center gap-2">
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

            {/* Bell */}
            <button
              type="button"
              aria-label={t('Notifications', 'الإشعارات')}
              className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-[#c8941a]/20 transition-all"
            >
              <Bell className="h-4 w-4" />
            </button>

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
                  <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 w-48 bg-[#0a0500] border border-[#c8941a]/15 rounded-xl shadow-2xl z-50 overflow-hidden">
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
                        onClick={handleSignOut}
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
        <main className="flex-1 pt-16 bg-[#0f0900]">
          {children}
        </main>
      </div>
    </div>
  )
}
