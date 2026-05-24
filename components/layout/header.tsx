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
import { NotificationCenter } from '@/components/notifications/notification-center'
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
  { href: '/blog', labelEn: 'Blog', labelAr: 'المدونة' },
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
  const [searchProducts, setSearchProducts] = useState<typeof sampleProducts>([])
  const [isMounted, setIsMounted] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const openCart = useCartStore((state) => state.openCart)
  const cartTotalItems = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )
  const openWishlist = useWishlistStore((state) => state.openWishlist)
  const wishlistTotalItems = useWishlistStore((state) => state.items.length)
  const { user, profile, signOut } = useAuth()
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  const cartItemCount = isMounted ? cartTotalItems : 0
  const wishlistItemCount = isMounted ? wishlistTotalItems : 0

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
    let mounted = true

    const loadSearchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=120', { cache: 'no-store' })
        const json = await response.json()
        type ProductResponseItem = {
          id?: string
          name_en?: string
          name_ar?: string
          slug?: string
        }

        const products = ((json?.data || []) as ProductResponseItem[])
          .filter((product) => product.id && product.slug && product.name_en && product.name_ar)
          .map((product) => ({
            id: String(product.id),
            slug: String(product.slug),
            name_en: String(product.name_en),
            name_ar: String(product.name_ar),
          }))

        if (mounted) setSearchProducts(products)
      } catch {
        if (mounted) setSearchProducts([])
      }
    }

    loadSearchProducts()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const filtered = searchProducts.filter(
        (p) => p.name_en.toLowerCase().includes(query) || p.name_ar.includes(searchQuery)
      )
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchProducts, searchQuery])

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

  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const toggleSearch = () => {
    if (isSearchOpen) closeSearch()
    else setIsSearchOpen(true)
  }

  return (
    <>
      <header
        className={cn(
          'w-full transition-all duration-[400ms] ease-in-out text-white relative z-50 isolate overflow-visible',
          showGlass ? 'nav-glass' : 'bg-transparent',
        )}
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

        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-24 relative">

            {/* Thin gold underline on transparent state */}
            {!showGlass && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(182,136,94,0.3), transparent)' }}
              />
            )}

            {/* Logo */}
            <Link href="/" className="flex min-w-0 items-center">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative h-10 w-28 sm:h-12 sm:w-36 md:h-20 md:w-[15rem]"
              >
                <Image
                  src="/brand/logo-white.svg"
                  alt="Line Coffee"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-center"
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
                    'group/nav relative px-1 py-2 text-[15px] font-medium tracking-wide nav-link',
                    pathname === link.href
                      ? 'text-[#FFF0E4] nav-link-active'
                      : 'text-[#D6B79A]/85 hover:text-[#F5E6D8]'
                  )}
                >
                  <span className="nav-sweep">{t(link.labelEn, link.labelAr)}</span>
                  <span className={cn(
                    "absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D6A373] to-transparent transition-all duration-300",
                    pathname === link.href ? "w-full shadow-[0_0_14px_rgba(214,163,115,0.45)]" : "w-0 group-hover/nav:w-full"
                  )} />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">

              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex items-center gap-1 rounded-full border border-transparent px-3 text-[#D6B79A]/75 hover:border-[#B6885E]/20 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8]"
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
              <div ref={searchRef} className="relative hidden md:flex items-center z-[80]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSearch}
                  className="text-[#D6B79A]/75 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8] hover:shadow-[0_0_24px_rgba(182,136,94,0.14)]"
                  aria-label={t('Search', 'بحث')}
                >
                  {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </Button>

                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-[calc(100%+0.8rem)] z-[90] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl shadow-2xl"
                      style={{
                        background: 'linear-gradient(180deg, rgba(18,13,9,0.98), rgba(11,8,6,0.98))',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(214,163,115,0.28)',
                        boxShadow: '0 24px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,230,216,0.03) inset',
                      }}
                    >
                      <div className="relative border-b border-[#B6885E]/15 p-3">
                        <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6885E]" />
                        <Input
                          type="text"
                          placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          className="h-11 rounded-xl pl-10 pr-10 text-sm"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label={t('Clear search', 'مسح البحث')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D6B79A]/55 transition-colors hover:text-[#F5E6D8]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {searchQuery && searchResults.length > 0 ? (
                        <div className="max-h-72 overflow-y-auto p-1.5">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleSearchSelect(product.slug)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150 hover:bg-[#B6885E]/12"
                            >
                              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#B6885E' }} />
                              <span className="text-sm" style={{ color: '#D6B79A' }}>
                                {language === 'ar' ? product.name_ar : product.name_en}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery ? (
                        <div className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(214,183,154,0.68)' }}>
                          {t('No products found', 'لا توجد منتجات')}
                        </div>
                      ) : (
                        <div className="px-4 py-5 text-center text-xs" style={{ color: 'rgba(183,155,133,0.58)' }}>
                          {t('Type to search the coffee collection', 'اكتب للبحث في مجموعة القهوة')}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NotificationCenter />

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openWishlist}
                className="relative hidden md:flex text-[#D6B79A]/75 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8] hover:shadow-[0_0_24px_rgba(182,136,94,0.14)]"
                aria-label={t('Wishlist', 'المفضلة')}
              >
                <Heart className="h-5 w-5" />
                {wishlistItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-4.5 w-4.5 min-w-[1.1rem] rounded-full text-[10px] flex items-center justify-center font-bold px-1"
                    style={{
                      background: 'linear-gradient(135deg, #B6885E, #D6A373)',
                      color: '#0B0806',
                    }}
                  >
                    {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                  </motion.span>
                )}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative text-[#D6B79A]/75 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8] hover:shadow-[0_0_24px_rgba(182,136,94,0.14)]"
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
                      className="hidden md:flex items-center gap-1.5 rounded-full border border-transparent px-3 max-w-[130px] text-[#D6B79A]/75 hover:border-[#B6885E]/20 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8]"
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
                          <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" />
                            {t('Edit Profile', 'تعديل الملف الشخصي')}
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
                      <>
                        <DropdownMenuItem asChild style={{ color: '#D6B79A' }} className="focus:bg-[#B6885E]/15">
                          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                            <LayoutDashboard className="h-4 w-4" />
                            {t('My Account', 'حسابي')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild style={{ color: '#D6B79A' }} className="focus:bg-[#B6885E]/15">
                          <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" />
                            {t('Edit Profile', 'تعديل الملف الشخصي')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild style={{ color: '#D6B79A' }} className="focus:bg-[#B6885E]/15">
                          <Link href="/dashboard/orders" className="flex items-center gap-2 cursor-pointer">
                            <Package className="h-4 w-4" />
                            {t('My Orders', 'طلباتي')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild style={{ color: '#D6B79A' }} className="focus:bg-[#B6885E]/15">
                          <Link href="/dashboard/wishlist" className="flex items-center gap-2 cursor-pointer">
                            <Heart className="h-4 w-4" />
                            {t('Wishlist', 'المفضلة')}
                          </Link>
                        </DropdownMenuItem>
                      </>
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
                  className="hidden md:flex text-[#D6B79A]/75 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8] hover:shadow-[0_0_24px_rgba(182,136,94,0.14)]"
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
                className="md:hidden text-[#D6B79A]/75 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8]"
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
                'absolute top-14 bottom-0 w-[min(18rem,calc(100vw-1rem))] shadow-2xl p-5 overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:top-16',
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
                <div className="relative z-20">
                  <Input
                    type="text"
                    placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-xl pr-10"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label={t('Clear search', 'مسح البحث')}
                      className="absolute right-3 top-3 text-[#D6B79A]/55"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {searchResults.length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl shadow-2xl"
                      style={{
                        background: 'rgba(18,13,9,0.99)',
                        border: '1px solid rgba(214,163,115,0.28)',
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
                  {searchQuery && searchResults.length === 0 && (
                    <div
                      className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl px-3 py-4 text-center text-sm text-[#D6B79A]/70 shadow-2xl"
                      style={{
                        background: 'rgba(18,13,9,0.99)',
                        border: '1px solid rgba(214,163,115,0.28)',
                      }}
                    >
                      {t('No products found', 'لا توجد منتجات')}
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
                        href={isAdmin ? '/dashboard/admin' : '/dashboard'}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-sm">
                          {isAdmin ? t('Dashboard', 'لوحة التحكم') : t('My Account', 'حسابي')}
                        </span>
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 py-2 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span className="text-sm">{t('Edit Profile', 'تعديل الملف الشخصي')}</span>
                      </Link>
                      {!isAdmin && (
                        <Link
                          href="/dashboard/orders"
                          className="flex items-center gap-3 py-2 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Package className="h-5 w-5" />
                          <span className="text-sm">{t('My Orders', 'طلباتي')}</span>
                        </Link>
                      )}
                      {!isAdmin && (
                        <Link
                          href="/dashboard/wishlist"
                          className="flex items-center gap-3 py-2 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Heart className="h-5 w-5" />
                          {wishlistItemCount > 0 && (
                            <span
                              className="ml-auto order-last min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold"
                              style={{
                                background: 'linear-gradient(135deg, #B6885E, #D6A373)',
                                color: '#0B0806',
                              }}
                            >
                              {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                            </span>
                          )}
                          <span className="text-sm">{t('Wishlist', 'المفضلة')}</span>
                        </Link>
                      )}
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
                  {!displayName && (
                    <button
                      onClick={() => { openWishlist(); setIsMobileMenuOpen(false) }}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Heart className="h-5 w-5" />
                      {wishlistItemCount > 0 && (
                        <span
                          className="ml-auto order-last min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #B6885E, #D6A373)',
                            color: '#0B0806',
                          }}
                        >
                          {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                        </span>
                      )}
                      <span className="text-sm">{t('Wishlist', 'المفضلة')}</span>
                    </button>
                  )}
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
