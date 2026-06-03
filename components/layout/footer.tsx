'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Mail, Music2, Phone, MapPin, Youtube } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { FOOTER_BLURB } from '@/lib/config/site'
import { formatPhoneHref, formatPublicAddress } from '@/lib/config/public-settings'
import { usePublicSettings } from '@/lib/hooks/use-public-settings'

type FooterCategory = {
  slug: string
  name_en: string
  name_ar: string
}

const FOOTER_CATEGORY_SLUGS = ['turkish-blends', 'espresso-blends', 'easy-coffee', 'flavor-coffee']
const FOOTER_MAKE_SLUGS = ['make-your-espresso', 'make-your-flavor']

const FALLBACK_CATEGORY_LINKS = [
  { href: '/products?category=turkish-blends', labelEn: 'Turkish Blends', labelAr: 'توليفات تركي' },
  { href: '/products?category=espresso-blends', labelEn: 'Espresso Blends', labelAr: 'توليفات إسبريسو' },
  { href: '/products?category=easy-coffee', labelEn: 'Easy Coffee', labelAr: 'إيزي كوفي' },
  { href: '/products?category=flavor-coffee', labelEn: 'Flavor Coffee', labelAr: 'قهوة بالنكهات' },
]

const FALLBACK_MAKE_LINKS = [
  { href: '/products?category=make-your-espresso', labelEn: 'Make Your Espresso', labelAr: 'اصنع إسبريسو خاصتك' },
  { href: '/products?category=make-your-flavor', labelEn: 'Make Your Flavor', labelAr: 'اصنع نكهتك' },
]

export function Footer() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [categories, setCategories] = useState<FooterCategory[]>([])
  const settings = usePublicSettings()
  const contactAddress = formatPublicAddress(settings.contact)
  const contactPhoneHref = formatPhoneHref(settings.contact.phone)
  const footerBlurb = settings.footer.footer_blurb
  const socialLinks = [
    { href: settings.socials.instagram_url, Icon: Instagram, label: 'Instagram' },
    { href: settings.socials.facebook_url, Icon: Facebook, label: 'Facebook' },
    { href: settings.socials.tiktok_url, Icon: Music2, label: 'TikTok' },
    { href: settings.socials.youtube_url, Icon: Youtube, label: 'YouTube' },
  ].filter((link) => link.href)

  useEffect(() => {
    let mounted = true

    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (mounted && Array.isArray(json?.data)) {
          setCategories(json.data.filter((category: FooterCategory) => category.slug && category.name_en))
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  const footerCategoryLinks = useMemo(() => {
    if (categories.length === 0) return FALLBACK_CATEGORY_LINKS
    return FOOTER_CATEGORY_SLUGS
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter((category): category is FooterCategory => Boolean(category))
      .map((category) => ({
        href: `/products?category=${category.slug}`,
        labelEn: category.name_en,
        labelAr: category.name_ar || category.name_en,
      }))
  }, [categories])

  const footerMakeLinks = useMemo(() => {
    if (categories.length === 0) return FALLBACK_MAKE_LINKS
    return FOOTER_MAKE_SLUGS
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter((category): category is FooterCategory => Boolean(category))
      .map((category) => ({
        href: `/products?category=${category.slug}`,
        labelEn: category.name_en,
        labelAr: category.name_ar || category.name_en,
      }))
  }, [categories])

  const footerLinks = {
    categories: footerCategoryLinks,
    make: footerMakeLinks,
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
      { href: '/privacy-policy', labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية' },
      { href: '/terms-of-use', labelEn: 'Terms of Use', labelAr: 'شروط الاستخدام' },
    ],
  }

  if (pathname.startsWith('/dashboard/admin')) return null

  return (
    <footer className="relative overflow-hidden" style={{ background: '#070504' }}>

      {/* Cinematic layered background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/25 to-transparent" />

      <div className="relative z-10">

        {/* Main footer content */}
        <div className="container mx-auto px-4 py-14 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12">

            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <span className="sr-only">{settings.brand.site_name}</span>
                <span className="relative block h-20 w-64 md:h-24 md:w-72">
                  <Image
                    src="/brand/logo-white.svg"
                    alt={settings.brand.logo_alt || settings.brand.site_name}
                    fill
                    unoptimized
                    className="object-contain object-left"
                  />
                </span>
              </Link>

              <p className="mb-7 max-w-sm leading-relaxed text-sm" style={{ color: 'rgba(183,155,133,0.75)' }}>
                {footerBlurb === FOOTER_BLURB ? t(
                  'Freshly roasted coffee crafted for warm daily rituals, from Turkish Blends to Espresso Blends and refined flavored favorites.',
                  'قهوة طازجة التحميص لطقوس يومية دافئة، من توليفات تركي إلى توليفات إسبريسو والنكهات المميزة.'
                ) : footerBlurb}
              </p>

              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map(({ href, Icon, label }) => (
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

            {/* Category links */}
            <div>
              <h4 className="font-semibold mb-5 text-sm tracking-wide" style={{ color: '#D6A373' }}>
                {t('Categories', 'الفئات')}
              </h4>
              <ul className="space-y-3">
                {footerLinks.categories.map((link) => (
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

            {/* Make links */}
            <div>
              <h4 className="font-semibold mb-5 text-sm tracking-wide" style={{ color: '#D6A373' }}>
                {t('Make Your Product', 'اصنع منتجك')}
              </h4>
              <ul className="space-y-3">
                {footerLinks.make.map((link) => (
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
                    {contactAddress || t('Cairo, Egypt', 'القاهرة، مصر')}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0" style={{ color: '#B6885E' }} />
                  <a
                    href={contactPhoneHref || undefined}
                    className="text-sm transition-colors duration-200 hover:text-[#D6A373]"
                    style={{ color: 'rgba(183,155,133,0.65)' }}
                  >
                    {settings.contact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0" style={{ color: '#B6885E' }} />
                  <a
                    href={`mailto:${settings.contact.email}`}
                    className="text-sm transition-colors duration-200 hover:text-[#D6A373]"
                    style={{ color: 'rgba(183,155,133,0.65)' }}
                  >
                    {settings.contact.email}
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
                &copy; {new Date().getFullYear()} {settings.brand.site_name}.{' '}
                {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
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
