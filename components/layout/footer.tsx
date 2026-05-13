'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { usePathname } from 'next/navigation'

export function Footer() {
  const { t } = useLanguage()
  const pathname = usePathname()
  if (pathname.startsWith('/dashboard/admin')) return null

  const footerLinks = {
    shop: [
      { href: '/products', labelEn: 'All Products', labelAr: 'جميع المنتجات' },
      { href: '/products?category=turkish-coffee', labelEn: 'Turkish Coffee', labelAr: 'قهوة تركي' },
      { href: '/products?category=espresso', labelEn: 'Espresso', labelAr: 'إسبريسو' },
      { href: '/products?category=cappuccino', labelEn: 'Cappuccino', labelAr: 'كابتشينو' },
      { href: '/products?featured=true', labelEn: 'Best Sellers', labelAr: 'الأكثر مبيعاً' },
    ],
    company: [
      { href: '/about', labelEn: 'About Us', labelAr: 'من نحن' },
      { href: '/contact', labelEn: 'Contact', labelAr: 'تواصل معنا' },
      { href: '/blog', labelEn: 'Blog', labelAr: 'المدونة' },
      { href: '/about#story', labelEn: 'Our Story', labelAr: 'قصتنا' },
      { href: '/about#sourcing', labelEn: 'Sourcing', labelAr: 'المصادر' },
    ],
    support: [
      { href: '/faq', labelEn: 'FAQ', labelAr: 'الأسئلة الشائعة' },
      { href: '/shipping', labelEn: 'Shipping', labelAr: 'الشحن' },
      { href: '/returns', labelEn: 'Returns', labelAr: 'الإرجاع' },
      { href: '/privacy', labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية' },
      { href: '/terms', labelEn: 'Terms of Service', labelAr: 'شروط الخدمة' },
    ],
  }

  return (
    <footer className="relative overflow-hidden" style={{ background: '#070504' }}>

      {/* Cinematic layered background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/25 to-transparent" />

      <div className="relative z-10">

        {/* Main footer content */}
        <div className="container mx-auto px-4 py-14 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">

            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <span className="sr-only">Line Coffee</span>
                <span className="relative block h-20 w-64 md:h-24 md:w-72">
                  <Image
                    src="/brand/logo-white.svg"
                    alt="Line Coffee"
                    fill
                    unoptimized
                    className="object-contain object-left"
                    style={{ filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.45)) brightness(1.07) contrast(1.02)' }}
                  />
                </span>
              </Link>

              <p className="mb-7 max-w-sm leading-relaxed text-sm" style={{ color: 'rgba(183,155,133,0.75)' }}>
                {t(
                  "Premium artisan coffee beans sourced from the world's finest growing regions. Experience the perfect cup, every time.",
                  'حبوب قهوة حرفية فاخرة من أفضل مناطق الزراعة في العالم. استمتع بالكوب المثالي، في كل مرة.'
                )}
              </p>

              {/* Social links */}
              <div className="flex gap-3">
                {[
                  { href: 'https://instagram.com/linecoffee.eg', Icon: Instagram, label: 'Instagram' },
                  { href: 'https://twitter.com', Icon: Twitter, label: 'Twitter' },
                  { href: 'https://facebook.com/linecoffee', Icon: Facebook, label: 'Facebook' },
                ].map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300"
                    style={{
                      background: 'rgba(182,136,94,0.08)',
                      border: '1px solid rgba(182,136,94,0.18)',
                      color: 'rgba(183,155,133,0.7)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      el.style.background = 'rgba(182,136,94,0.18)'
                      el.style.color = '#D6A373'
                      el.style.borderColor = 'rgba(182,136,94,0.4)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      el.style.background = 'rgba(182,136,94,0.08)'
                      el.style.color = 'rgba(183,155,133,0.7)'
                      el.style.borderColor = 'rgba(182,136,94,0.18)'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop links */}
            <div>
              <h4 className="font-semibold mb-5 text-sm tracking-wide" style={{ color: '#D6A373' }}>
                {t('Shop', 'المتجر')}
              </h4>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200 hover:text-[#D6A373]"
                      style={{ color: 'rgba(183,155,133,0.65)' }}
                    >
                      {t(link.labelEn, link.labelAr)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 className="font-semibold mb-5 text-sm tracking-wide" style={{ color: '#D6A373' }}>
                {t('Company', 'الشركة')}
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200 hover:text-[#D6A373]"
                      style={{ color: 'rgba(183,155,133,0.65)' }}
                    >
                      {t(link.labelEn, link.labelAr)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-5 text-sm tracking-wide" style={{ color: '#D6A373' }}>
                {t('Contact', 'تواصل')}
              </h4>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#B6885E' }} />
                  <span className="text-sm" style={{ color: 'rgba(183,155,133,0.65)' }}>
                    {t('Cairo, Egypt', 'القاهرة، مصر')}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0" style={{ color: '#B6885E' }} />
                  <a
                    href="tel:+201004761171"
                    className="text-sm transition-colors duration-200 hover:text-[#D6A373]"
                    style={{ color: 'rgba(183,155,133,0.65)' }}
                  >
                    +201004761171
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0" style={{ color: '#B6885E' }} />
                  <a
                    href="mailto:m.sayed@abu-elhassan.com"
                    className="text-sm transition-colors duration-200 hover:text-[#D6A373]"
                    style={{ color: 'rgba(183,155,133,0.65)' }}
                  >
                    m.sayed@abu-elhassan.com
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t"
          style={{ borderColor: 'rgba(182,136,94,0.1)' }}
        >
          <div className="container mx-auto px-4 py-5">
            <div
              className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs"
              style={{ color: 'rgba(183,155,133,0.45)' }}
            >
              <p>
                &copy; {new Date().getFullYear()} Line Coffee.{' '}
                {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
              </p>
              <div className="flex gap-5">
                {footerLinks.support.slice(3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors duration-200 hover:text-[#B6885E]"
                  >
                    {t(link.labelEn, link.labelAr)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
