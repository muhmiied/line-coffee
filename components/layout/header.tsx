'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Heart,
  ChevronDown,
  Package,
  LogOut,
  LayoutDashboard,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useAuth } from '@/lib/context/auth'
import { ADMIN_EMAIL } from '@/lib/config/site'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', labelEn: 'Home', labelAr: 'الرئيسية' },
  { href: '/products', labelEn: 'Products', labelAr: 'المنتجات' },
  { href: '/about', labelEn: 'About', labelAr: 'من نحن' },
  { href: '/contact', labelEn: 'Contact', labelAr: 'تواصل معنا' },
]

const sampleProducts = [
  { id: '1', name_en: 'Turkish Coffee Classic', name_ar: 'قهوة تركية كلاسيك', slug: 'turkish-coffee-classic' },
  { id: '2', name_en: 'Turkish Coffee Dark', name_ar: 'قهوة تركية غامقة', slug: 'turkish-coffee-dark' },
  { id: '3', name_en: 'Turkish Coffee Light', name_ar: 'قهوة تركية فاتحة', slug: 'turkish-coffee-light' },
  { id: '4', name_en: 'Espresso Blend', name_ar: 'خلطة إسبريسو', slug: 'espresso-blend' },
  { id: '5', name_en: 'Espresso Intenso', name_ar: 'إسبريسو إنتنسو', slug: 'espresso-intenso' },
  { id: '6', name_en: 'Cappuccino Mix', name_ar: 'كابتشينو ميكس', slug: 'cappuccino-mix' },
  { id: '7', name_en: 'Cappuccino Vanilla', name_ar: 'كابتشينو فانيلا', slug: 'cappuccino-vanilla' },
  { id: '8', name_en: 'Cappuccino Caramel', name_ar: 'كابتشينو كراميل', slug: 'cappuccino-caramel' },
  { id: '9', name_en: 'Hazelnut Coffee', name_ar: 'قهوة بالبندق', slug: 'hazelnut-coffee' },
  { id: '10', name_en: 'Vanilla Latte', name_ar: 'فانيلا لاتيه', slug: 'vanilla-latte' },
  { id: '11', name_en: 'Hot Chocolate Classic', name_ar: 'هوت شوكلت كلاسيك', slug: 'hot-chocolate-classic' },
  { id: '12', name_en: 'Hot Chocolate Dark', name_ar: 'هوت شوكلت غامق', slug: 'hot-chocolate-dark' },
  { id: '13', name_en: 'Coffee Mix 3in1', name_ar: 'كوفي ميكس 3 في 1', slug: 'coffee-mix-3in1' },
  { id: '14', name_en: 'Mocha Coffee', name_ar: 'قهوة موكا', slug: 'mocha-coffee' },
  { id: '15', name_en: 'French Vanilla', name_ar: 'فرنش فانيلا', slug: 'french-vanilla' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<typeof sampleProducts>([])
  const [isMounted, setIsMounted] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const { openCart, getTotalItems } = useCartStore()
  const { openWishlist } = useWishlistStore()
  const { user, profile, signOut } = useAuth()
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  const cartItemCount = isMounted ? getTotalItems() : 0

  const isTransparentTop =
    pathname === '/' ||
    pathname === '/products' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/products/')

  const showGlass = !isTransparentTop || isScrolled

  const displayName =
    profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || null

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const filtered = sampleProducts.filter(
        (p) => p.name_en.toLowerCase().includes(query) || p.name_ar.includes(searchQuery)
      )
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSelect = (slug: string) => {
    router.push(`/products/${slug}`)
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <header
        className={cn(
          'w-full transition-all duration-[400ms] ease-in-out text-white relative z-50',
          !showGlass && 'bg-transparent',
        )}
        style={showGlass ? {
          background: 'rgba(10,7,5,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(182,136,94,0.12)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4), 0 0 0 0 rgba(182,136,94,0)',
        } : undefined}
      >
        {/* Overlay layers */}
        {showGlass ? (
          <>
            {/* Subtle gold sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B6885E]/[0.04] to-transparent pointer-events-none" />
            {/* Top gold line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/30 to-transparent pointer-events-none" />
            {/* Inner top shimmer */}
            <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-[#B6885E]/[0.04] to-transparent pointer-events-none" />
          </>
        ) : (
          /* Dark scrim on transparent header */
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-20 md:h-24 relative">

            {/* Thin gold underline on transparent state */}
            {!showGlass && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(182,136,94,0.3), transparent)' }}
              />
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative h-[4rem] w-[13rem] md:h-[4.5rem] md:w-[15rem]"
              >
                <Image
                  src="/brand/logo-white.svg"
                  alt="Line Coffee"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-center"
                  style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.5)) sepia(0.3) brightness(0.97)' }}
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative text-base font-serif font-medium transition-colors duration-200',
                    pathname === link.href
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {t(link.labelEn, link.labelAr)}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-px rounded-full"
                      style={{ background: 'linear-gradient(to right, #B6885E, #D6A373)' }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">

              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex items-center gap-1 px-2 text-white/70 hover:text-white hover:bg-white/8"
                  >
                    <span className="text-sm">{language === 'en' ? 'EN' : 'AR'}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  style={{
                    background: 'rgba(18,13,9,0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(182,136,94,0.18)',
                  }}
                >
                  <DropdownMenuItem
                    onClick={() => setLanguage('en')}
                    style={{ color: '#F5E6D8' }}
                    className="focus:bg-[#B6885E]/15 focus:text-[#D6A373]"
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage('ar')}
                    style={{ color: '#F5E6D8' }}
                    className="focus:bg-[#B6885E]/15 focus:text-[#D6A373]"
                  >
                    عربي
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search */}
              <div ref={searchRef} className="relative hidden md:flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 260, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <Input
                        type="text"
                        placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="h-9 text-sm"
                        style={{
                          background: 'rgba(182,136,94,0.08)',
                          border: '1px solid rgba(182,136,94,0.25)',
                          color: '#F5E6D8',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-white/70 hover:text-white hover:bg-white/8"
                  aria-label={t('Search', 'بحث')}
                >
                  {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </Button>

                <AnimatePresence>
                  {isSearchOpen && (searchResults.length > 0 || searchQuery) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden"
                      style={{
                        background: 'rgba(18,13,9,0.96)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(182,136,94,0.18)',
                      }}
                    >
                      {searchResults.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleSearchSelect(product.slug)}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-150 hover:bg-[#B6885E]/10"
                            >
                              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#B6885E' }} />
                              <span className="text-sm" style={{ color: '#D6B79A' }}>
                                {language === 'ar' ? product.name_ar : product.name_en}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery ? (
                        <div className="px-4 py-5 text-center text-sm" style={{ color: 'rgba(183,155,133,0.6)' }}>
                          {t('No products found', 'لا توجد منتجات')}
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openWishlist}
                className="hidden md:flex text-white/70 hover:text-white hover:bg-white/8"
                aria-label={t('Wishlist', 'المفضلة')}
              >
                <Heart className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative text-white/70 hover:text-white hover:bg-white/8"
                aria-label={t('Cart', 'السلة')}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-4.5 w-4.5 min-w-[1.1rem] rounded-full text-[10px] flex items-center justify-center font-bold px-1"
                    style={{
                      background: 'linear-gradient(135deg, #B6885E, #D6A373)',
                      color: '#0B0806',
                    }}
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </motion.span>
                )}
              </Button>

              {/* User */}
              {displayName ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex items-center gap-1.5 px-2 max-w-[120px] text-white/70 hover:text-white hover:bg-white/8"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span className="text-sm truncate">{displayName}</span>
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48"
                    style={{
                      background: 'rgba(18,13,9,0.96)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(182,136,94,0.18)',
                    }}
                  >
                    {isAdmin ? (
                      <>
                        <DropdownMenuItem asChild style={{ color: '#D6B79A' }} className="focus:bg-[#B6885E]/15">
                          <Link href="/dashboard/admin" className="flex items-center gap-2 cursor-pointer">
                            <LayoutDashboard className="h-4 w-4" />
                            {t('Dashboard', 'لوحة التحكم')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild style={{ color: '#D6B79A' }} className="focus:bg-[#B6885E]/15">
                          <Link href="/" className="flex items-center gap-2 cursor-pointer">
                            <Globe className="h-4 w-4" />
                            {t('Website', 'الموقع')}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem asChild style={{ color: '#D6B79A' }} className="focus:bg-[#B6885E]/15">
                        <Link href="/dashboard/orders" className="flex items-center gap-2 cursor-pointer">
                          <Package className="h-4 w-4" />
                          {t('My Orders', 'أوردراتي')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator style={{ background: 'rgba(182,136,94,0.12)' }} />
                    <DropdownMenuItem
                      onSelect={() => void signOut()}
                      className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('Sign Out', 'تسجيل خروج')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hidden md:flex text-white/70 hover:text-white hover:bg-white/8"
                >
                  <Link href="/auth/login" aria-label={t('Account', 'الحساب')}>
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white/70 hover:text-white hover:bg-white/8"
                aria-label={t('Menu', 'القائمة')}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.nav
              initial={{ x: language === 'ar' ? -300 : 300 }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? -300 : 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'absolute top-16 bottom-0 w-72 shadow-2xl p-6 overflow-y-auto',
                language === 'ar' ? 'left-0' : 'right-0'
              )}
              style={{
                background: 'rgba(15,10,7,0.97)',
                backdropFilter: 'blur(20px)',
                borderLeft: language !== 'ar' ? '1px solid rgba(182,136,94,0.15)' : undefined,
                borderRight: language === 'ar' ? '1px solid rgba(182,136,94,0.15)' : undefined,
              }}
            >
              <div className="flex flex-col gap-6">

                {/* Mobile Search */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'rgba(182,136,94,0.08)',
                      border: '1px solid rgba(182,136,94,0.2)',
                      color: '#F5E6D8',
                    }}
                  />
                  {searchResults.length > 0 && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10"
                      style={{
                        background: 'rgba(18,13,9,0.98)',
                        border: '1px solid rgba(182,136,94,0.15)',
                      }}
                    >
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => { handleSearchSelect(product.slug); setIsMobileMenuOpen(false) }}
                          className="w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#B6885E]/12"
                          style={{ color: '#D6B79A' }}
                        >
                          {language === 'ar' ? product.name_ar : product.name_en}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'block text-base font-medium py-2.5 px-3 rounded-lg transition-colors duration-200',
                          pathname === link.href
                            ? 'text-[#D6A373] bg-[#B6885E]/10'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {t(link.labelEn, link.labelAr)}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="h-px" style={{ background: 'rgba(182,136,94,0.12)' }} />

                <div className="flex flex-col gap-3">
                  {displayName ? (
                    <>
                      <Link
                        href={isAdmin ? '/dashboard/admin' : '/dashboard/orders'}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {isAdmin ? <LayoutDashboard className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        <span className="text-sm">
                          {isAdmin ? t('Dashboard', 'لوحة التحكم') : t('My Orders', 'أوردراتي')}
                        </span>
                      </Link>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); void signOut() }}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg text-red-400 hover:bg-red-500/8 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm">{t('Sign Out', 'تسجيل خروج')}</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="flex items-center gap-3 py-2 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-sm">{t('Sign In', 'تسجيل الدخول')}</span>
                    </Link>
                  )}
                  <button
                    onClick={() => { openWishlist(); setIsMobileMenuOpen(false) }}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{t('Wishlist', 'المفضلة')}</span>
                  </button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      style={{
                        background: 'rgba(182,136,94,0.08)',
                        border: '1px solid rgba(182,136,94,0.2)',
                        color: '#D6B79A',
                      }}
                    >
                      {language === 'en' ? 'English' : 'عربي'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-full"
                    style={{
                      background: 'rgba(18,13,9,0.96)',
                      border: '1px solid rgba(182,136,94,0.18)',
                    }}
                  >
                    <DropdownMenuItem onClick={() => setLanguage('en')} style={{ color: '#D6B79A' }}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('ar')} style={{ color: '#D6B79A' }}>
                      عربي
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
