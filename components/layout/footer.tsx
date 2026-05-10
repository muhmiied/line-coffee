'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <footer className="relative overflow-hidden text-[#FFDCC2]">
      {/* Glass/Crystal gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#522500] via-[#6b3200] to-[#4a2200]" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[#FFDCC2]/10 via-transparent to-[#FFDCC2]/5" />
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#FFDCC2]/15 to-transparent" />
      <div className="absolute inset-0 brand-pattern-dark opacity-[0.08]" />
      <div className="relative z-10">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <span className="sr-only">Line Coffee</span>
              <span className="relative block h-16 w-[14.5rem] md:h-20 md:w-[17rem]">
                <Image
                  src="/brand/logo-white.svg"
                  alt="Line Coffee"
                  fill
                  unoptimized
                  className="object-contain object-left"
                />
              </span>
            </Link>
            <p className="text-[#FFDCC2]/85 mb-6 max-w-sm">
              {t(
                'Premium artisan coffee beans sourced from the world\'s finest growing regions. Experience the perfect cup, every time.',
                'حبوب قهوة حرفية فاخرة من أفضل مناطق الزراعة في العالم. استمتع بالكوب المثالي، في كل مرة.'
              )}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com/linecoffee.eg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFDCC2]/85 hover:text-[#FFDCC2] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFDCC2]/85 hover:text-[#FFDCC2] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/linecoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFDCC2]/85 hover:text-[#FFDCC2] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[#FFDCC2]">{t('Shop', 'المتجر')}</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#FFDCC2]/80 hover:text-[#FFDCC2] transition-colors"
                  >
                    {t(link.labelEn, link.labelAr)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[#FFDCC2]">{t('Company', 'الشركة')}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#FFDCC2]/80 hover:text-[#FFDCC2] transition-colors"
                  >
                    {t(link.labelEn, link.labelAr)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-[#FFDCC2]">{t('Contact', 'تواصل')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-[#FFDCC2]/80">
                  {t('Cairo, Egypt', 'القاهرة، مصر')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" />
                <a
                  href="tel:+201004761171"
                  className="text-[#FFDCC2]/80 hover:text-[#FFDCC2] transition-colors"
                >
                  +201004761171
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 shrink-0" />
                <a
                  href="mailto:m.sayed@abu-elhassan.com"
                  className="text-[#FFDCC2]/80 hover:text-[#FFDCC2] transition-colors"
                >
                  m.sayed@abu-elhassan.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#FFDCC2]/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#FFDCC2]/70">
            <p>
              &copy; {new Date().getFullYear()} Line Coffee.{' '}
              {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
            </p>
            <div className="flex gap-4">
              {footerLinks.support.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#FFDCC2]/70 hover:text-[#FFDCC2] transition-colors"
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
