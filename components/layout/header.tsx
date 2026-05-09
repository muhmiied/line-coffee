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
  const cartItemCount = isMounted ? getTotalItems() : 0

  // Pages where header starts transparent and turns brown on scroll
  const isTransparentTop =
    pathname === '/' ||
    pathname === '/products' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/products/')

  // Show brown glass background: always on non-transparent pages, or when scrolled
  const showBrown = !isTransparentTop || isScrolled

  const displayName = isMounted
    ? (profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || null)
    : null

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const filtered = sampleProducts.filter(
        (p) =>
          p.name_en.toLowerCase().includes(query) ||
          p.name_ar.includes(searchQuery)
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
          'w-full transition-all duration-[400ms] ease-in-out text-white relative overflow-hidden',
          !showBrown && 'bg-transparent',
          showBrown && 'backdrop-blur-[18px]'
        )}
        style={
          showBrown
            ? {
                background:
                  'linear-gradient(180deg, rgba(255,220,194,0.13) 0%, transparent 60%), rgba(82,37,0,0.92)',
              }
            : undefined
        }
      >
        {/* Cream shimmer overlay — visible when brown */}
        {showBrown && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFDCC2]/[0.07] to-transparent pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFDCC2]/40 to-transparent pointer-events-none" />
          </>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-20 md:h-24 relative">
            {/* Subtle bottom line on home transparent state */}
            {!showBrown && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] md:w-[60%] h-[2px] bg-white/40 rounded-full" />
            )}

            {/* Logo — always white since bg is always dark when visible */}
            <Link href="/" className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative h-[3.5rem] w-[12rem] md:h-[4rem] md:w-[14rem]"
              >
                <Image
                  src="/brand/logo-white.svg"
                  alt="Line Coffee"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-center drop-shadow-[0_3px_16px_rgba(0,0,0,0.45)]"
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
                    'relative text-base md:text-lg font-serif font-medium transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]',
                    pathname === link.href ? 'text-[#FFDCC2]' : 'text-white'
                  )}
                >
                  {t(link.labelEn, link.labelAr)}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FFDCC2] rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex items-center gap-1 px-2 text-white hover:bg-white/10 hover:text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
                  >
                    <span className="text-sm">{language === 'en' ? 'EN' : 'AR'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ar')}>عربي</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search */}
              <div ref={searchRef} className="relative hidden md:flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <Input
                        type="text"
                        placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/60 h-9 text-sm backdrop-blur-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-white hover:bg-white/10 hover:text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
                  aria-label={t('Search', 'بحث')}
                >
                  {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </Button>

                <AnimatePresence>
                  {isSearchOpen && (searchResults.length > 0 || searchQuery) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-card rounded-lg shadow-xl border border-border overflow-hidden"
                    >
                      {searchResults.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleSearchSelect(product.slug)}
                              className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3"
                            >
                              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm">
                                {language === 'ar' ? product.name_ar : product.name_en}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
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
                className="hidden md:flex text-white hover:bg-white/10 hover:text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
                aria-label={t('Wishlist', 'المفضلة')}
              >
                <Heart className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative text-white hover:bg-white/10 hover:text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
                aria-label={t('Cart', 'السلة')}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#FFDCC2] text-[#522500] text-xs flex items-center justify-center font-medium"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </motion.span>
                )}
              </Button>

              {/* User */}
              {isMounted && displayName ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex items-center gap-1.5 px-2 max-w-[120px] text-white hover:bg-white/10 hover:text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span className="text-sm truncate">{displayName}</span>
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders" className="flex items-center gap-2 cursor-pointer">
                        <Package className="h-4 w-4" />
                        {t('My Orders', 'أوردراتي')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => { signOut(); router.push('/') }}
                      className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
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
                  className="hidden md:flex text-white hover:bg-white/10 hover:text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
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
                className="md:hidden text-white hover:bg-white/10 hover:text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
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
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.nav
              initial={{ x: language === 'ar' ? -300 : 300 }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? -300 : 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'absolute top-16 bottom-0 w-72 bg-card border-border shadow-xl p-6 overflow-y-auto',
                language === 'ar' ? 'left-0 border-r' : 'right-0 border-l'
              )}
            >
              <div className="flex flex-col gap-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-secondary/50"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border max-h-48 overflow-y-auto z-10">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            handleSearchSelect(product.slug)
                            setIsMobileMenuOpen(false)
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-secondary/50 transition-colors text-sm"
                        >
                          {language === 'ar' ? product.name_ar : product.name_en}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'block text-lg font-medium py-2 transition-colors hover:text-primary',
                          pathname === link.href ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {t(link.labelEn, link.labelAr)}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="h-px bg-border" />

                <div className="flex flex-col gap-4">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>{t('Sign In', 'تسجيل الدخول')}</span>
                  </Link>
                  <button
                    onClick={() => { openWishlist(); setIsMobileMenuOpen(false) }}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span>{t('Wishlist', 'المفضلة')}</span>
                  </button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {language === 'en' ? 'English' : 'عربي'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('ar')}>عربي</DropdownMenuItem>
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
