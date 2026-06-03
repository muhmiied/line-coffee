'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/context/language'
import { useSectionContent } from '@/lib/hooks/use-section-media'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  getMediaObjectPosition,
  getMediaOverlayOpacity,
  getVisualEffects,
  GRAIN_SVG,
} from '@/lib/media'
import { toast } from 'sonner'
import { formatPhoneHref, formatPublicAddress } from '@/lib/config/public-settings'
import { usePublicSettings } from '@/lib/hooks/use-public-settings'
import { useWhatsAppSettings } from '@/lib/hooks/use-whatsapp-settings'

export default function ContactPage() {
  const { t } = useLanguage()
  const { media: sectionMedia, content: sectionContent } = useSectionContent('contact_page')
  const settings = usePublicSettings()
  const { phone: whatsappPhone, displayPhone: whatsappDisplayPhone } = useWhatsAppSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const bgFx = getVisualEffects(sectionMedia)
  const bgFilter = buildEffectsFilter(bgFx)
  const overlayOpacity = sectionMedia ? getMediaOverlayOpacity(sectionMedia, 0.82) : 0.82
  const bgOverlay = buildOverlayGradient(bgFx.gradient_type, bgFx.overlay_color, overlayOpacity)
  const contactAddress = formatPublicAddress(settings.contact)
  const contactPhoneHref = formatPhoneHref(settings.contact.phone)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    }

    const errors: Record<string, string> = {}
    if (!payload.name) errors.name = t('Name is required', 'الاسم مطلوب')
    if (!payload.email) errors.email = t('Email is required', 'البريد الإلكتروني مطلوب')
    else if (!/^\S+@\S+\.\S+$/.test(payload.email)) errors.email = t('Please enter a valid email', 'من فضلك أدخل بريد إلكتروني صحيح')
    if (!payload.subject) errors.subject = t('Subject is required', 'الموضوع مطلوب')
    if (!payload.message) errors.message = t('Message is required', 'الرسالة مطلوبة')

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error(t('Please fix the highlighted fields', 'يرجى تصحيح الحقول المحددة'))
      requestAnimationFrame(() => {
        document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message')
      }

      if (result.whatsapp_url) {
        const opened = window.open(result.whatsapp_url, '_blank', 'noopener,noreferrer')
        if (!opened) window.location.href = result.whatsapp_url
        toast.success(t('Message saved. Opening WhatsApp...', 'تم حفظ الرسالة. جاري فتح واتساب...'))
      } else {
        toast.warning(t(
          'Message saved, but WhatsApp is not configured.',
          'تم حفظ الرسالة، لكن واتساب غير مفعّل.'
        ))
      }

      form.reset()
      setFieldErrors({})
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Failed to send message', 'فشل إرسال الرسالة'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      labelEn: 'Address',
      labelAr: 'العنوان',
      valueEn: contactAddress,
      valueAr: contactAddress,
    },
    {
      icon: Phone,
      labelEn: 'Phone',
      labelAr: 'الهاتف',
      valueEn: settings.contact.phone,
      valueAr: settings.contact.phone,
      href: contactPhoneHref,
    },
    {
      icon: Mail,
      labelEn: 'Email',
      labelAr: 'البريد الإلكتروني',
      valueEn: settings.contact.email,
      valueAr: settings.contact.email,
      href: `mailto:${settings.contact.email}`,
    },
    {
      icon: MessageCircle,
      labelEn: 'WhatsApp',
      labelAr: 'واتساب',
      valueEn: whatsappDisplayPhone,
      valueAr: whatsappDisplayPhone,
      href: `https://wa.me/${whatsappPhone}`,
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0B0806' }}>
      {sectionMedia?.image_url && (
        <>
          <Image
            src={sectionMedia.image_url}
            alt={sectionMedia.alt_en || sectionContent.title_en || ''}
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover"
            style={{ objectPosition: getMediaObjectPosition(sectionMedia), filter: bgFilter || undefined }}
            unoptimized
          />
          <div className="absolute inset-0" style={{ background: bgOverlay }} />
          {Number(bgFx.grain || 0) > 0.05 && (
            <div className="absolute inset-0 mix-blend-screen" style={{ opacity: Number(bgFx.grain), backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px' }} />
          )}
        </>
      )}

      {/* Cinematic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,_rgba(182,136,94,0.05)_0%,_transparent_70%)]" />
      </div>

      {/* Header */}
      <div className="relative pt-32 md:pt-40 pb-12 md:pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#B6885E]/60" />
            <p className="text-[11px] tracking-[0.28em] uppercase font-semibold" style={{ color: '#B6885E' }}>
              {t(sectionContent.eyebrow_en || 'Get In Touch', sectionContent.eyebrow_ar || 'تواصل معنا')}
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#B6885E]/60" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F5E6D8' }}>
            {t(sectionContent.title_en || 'Contact Us', sectionContent.title_ar || 'تواصل معنا')}
          </h1>
          <p className="max-w-2xl mx-auto px-4" style={{ color: 'rgba(183,155,133,0.72)' }}>
            {t(
              sectionContent.body_en || sectionContent.subtitle_en || 'Have a question, order request, or partnership idea? We would love to hear from you.',
              sectionContent.body_ar || sectionContent.subtitle_ar || 'لديك سؤال أو طلب أو فكرة تعاون؟ يسعدنا التواصل معك.'
            )}
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {contactInfo.map((item, index) => {
              const Icon = item.icon
              const content = (
                <div
                  className="flex items-start gap-4 p-5 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(24,18,13,0.7)',
                    border: '1px solid rgba(182,136,94,0.15)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(182,136,94,0.1)',
                      border: '1px solid rgba(182,136,94,0.22)',
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: '#B6885E' }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-0.5" style={{ color: '#F5E6D8' }}>
                      {t(item.labelEn, item.labelAr)}
                    </h3>
                    <p className="text-sm" style={{ color: 'rgba(183,155,133,0.65)' }}>
                      {t(item.valueEn, item.valueAr)}
                    </p>
                  </div>
                </div>
              )

              return item.href ? (
                <a
                  key={index}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block transition-transform hover:scale-[1.01]"
                >
                  {content}
                </a>
              ) : (
                <div key={index}>{content}</div>
              )
            })}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: 'rgba(24,18,13,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(182,136,94,0.15)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
              }}
            >
              <h2 className="font-serif text-xl font-semibold mb-6" style={{ color: '#F5E6D8' }}>
                {t('Send us a Message', 'أرسل لنا رسالة')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(183,155,133,0.8)' }}>
                      {t('Name', 'الاسم')}
                    </label>
                    <Input
                      name="name"
                      required
                      placeholder={t('Your name', 'اسمك')}
                      aria-invalid={Boolean(fieldErrors.name)}
                      onChange={() => setFieldErrors(prev => ({ ...prev, name: '' }))}
                      style={{
                        background: 'rgba(182,136,94,0.07)',
                        border: '1px solid rgba(182,136,94,0.18)',
                        color: '#F5E6D8',
                      }}
                    />
                    {fieldErrors.name && <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(183,155,133,0.8)' }}>
                      {t('Email', 'البريد الإلكتروني')}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder={t('your@email.com', 'name@example.com')}
                      aria-invalid={Boolean(fieldErrors.email)}
                      onChange={() => setFieldErrors(prev => ({ ...prev, email: '' }))}
                      style={{
                        background: 'rgba(182,136,94,0.07)',
                        border: '1px solid rgba(182,136,94,0.18)',
                        color: '#F5E6D8',
                      }}
                    />
                    {fieldErrors.email && <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(183,155,133,0.8)' }}>
                    {t('Subject', 'الموضوع')}
                  </label>
                  <Input
                    name="subject"
                    required
                    placeholder={t('How can we help?', 'كيف يمكننا مساعدتك؟')}
                    aria-invalid={Boolean(fieldErrors.subject)}
                    onChange={() => setFieldErrors(prev => ({ ...prev, subject: '' }))}
                    style={{
                      background: 'rgba(182,136,94,0.07)',
                      border: '1px solid rgba(182,136,94,0.18)',
                      color: '#F5E6D8',
                  }}
                />
                  {fieldErrors.subject && <p className="mt-1 text-xs text-destructive">{fieldErrors.subject}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(183,155,133,0.8)' }}>
                    {t('Message', 'الرسالة')}
                  </label>
                  <Textarea
                    name="message"
                    required
                    rows={5}
                    className="resize-none"
                    placeholder={t('Your message...', 'رسالتك...')}
                    aria-invalid={Boolean(fieldErrors.message)}
                    onChange={() => setFieldErrors(prev => ({ ...prev, message: '' }))}
                    style={{
                      background: 'rgba(182,136,94,0.07)',
                      border: '1px solid rgba(182,136,94,0.18)',
                      color: '#F5E6D8',
                  }}
                />
                  {fieldErrors.message && <p className="mt-1 text-xs text-destructive">{fieldErrors.message}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold tracking-wide transition-all duration-300"
                  size="lg"
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #B6885E 0%, #D6A373 100%)',
                    color: '#0B0806',
                    boxShadow: '0 4px 20px rgba(182,136,94,0.3)',
                  }}
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-[#0B0806]/40 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 me-2" />
                      {t('Send Message', 'إرسال الرسالة')}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
