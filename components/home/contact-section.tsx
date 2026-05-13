'use client'

import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/context/language'
import { SectionReveal, FadeUp, StaggerContainer, WordByWord } from '@/components/ui/motion-primitives'
import { WHATSAPP_ORDER_PHONE_E164, WHATSAPP_DISPLAY, CONTACT_EMAIL } from '@/lib/config/site'

const contactItems = [
  {
    Icon: MapPin,
    labelEn: 'Location',
    labelAr: 'الموقع',
    valueEn: 'Cairo, Egypt',
    valueAr: 'القاهرة، مصر',
    href: undefined,
  },
  {
    Icon: Phone,
    labelEn: 'Phone / WhatsApp',
    labelAr: 'الهاتف / واتساب',
    valueEn: WHATSAPP_DISPLAY,
    valueAr: WHATSAPP_DISPLAY,
    href: `https://wa.me/${WHATSAPP_ORDER_PHONE_E164}`,
  },
  {
    Icon: Mail,
    labelEn: 'Email',
    labelAr: 'البريد الإلكتروني',
    valueEn: CONTACT_EMAIL,
    valueAr: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    Icon: Clock,
    labelEn: 'Working Hours',
    labelAr: 'ساعات العمل',
    valueEn: 'Sun - Thu: 9AM - 6PM',
    valueAr: 'الأحد - الخميس: 9ص - 6م',
    href: undefined,
  },
]

export function ContactSection() {
  const { t } = useLanguage()

  return (
    <SectionReveal className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#0B0806' }}>

      {/* Cinematic background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">

          {/* Contact Info */}
          <FadeUp>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-[#B6885E]/60 to-transparent" />
              <p className="text-[11px] tracking-[0.24em] uppercase font-semibold" style={{ color: '#B6885E' }}>
                {t('Get In Touch', 'تواصل معنا')}
              </p>
            </div>

            <div className="font-serif text-3xl md:text-4xl font-bold mb-6" style={{ color: '#F5E6D8' }}>
              <WordByWord text={t("We'd Love To Hear From You", 'نحب أن نسمع منك')} />
            </div>

            <p className="mb-10 max-w-md leading-relaxed" style={{ color: 'rgba(183,155,133,0.72)' }}>
              {t(
                "Have a question about our products or want to place a bulk order? Reach out and we'll get back to you within 24 hours.",
                'لديك سؤال عن منتجاتنا أو تريد طلب كمية كبيرة؟ تواصل معنا وسنرد عليك خلال 24 ساعة.'
              )}
            </p>

            <StaggerContainer className="space-y-5">
              {contactItems.map(({ Icon, labelEn, labelAr, valueEn, valueAr, href }) => (
                <FadeUp key={labelEn} className="flex items-start gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(182,136,94,0.1)',
                      border: '1px solid rgba(182,136,94,0.22)',
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: '#B6885E' }} />
                  </div>
                  <div>
                    <p className="font-medium mb-0.5" style={{ color: '#F5E6D8' }}>
                      {t(labelEn, labelAr)}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('https') ? '_blank' : undefined}
                        rel={href.startsWith('https') ? 'noopener noreferrer' : undefined}
                        className="text-sm transition-colors duration-200 hover:text-[#D6A373]"
                        style={{ color: 'rgba(183,155,133,0.65)' }}
                      >
                        {t(valueEn, valueAr)}
                      </a>
                    ) : (
                      <p className="text-sm" style={{ color: 'rgba(183,155,133,0.65)' }}>
                        {t(valueEn, valueAr)}
                      </p>
                    )}
                  </div>
                </FadeUp>
              ))}
            </StaggerContainer>
          </FadeUp>

          {/* Contact Form */}
          <FadeUp>
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
              <h3 className="font-serif text-xl font-semibold mb-6" style={{ color: '#F5E6D8' }}>
                {t('Send Us a Message', 'أرسل لنا رسالة')}
              </h3>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const name = fd.get('name') as string
                  const emailVal = fd.get('email') as string
                  const subject = fd.get('subject') as string
                  const message = fd.get('message') as string
                  const text = `رسالة من الموقع:\nالاسم: ${name}\nالإيميل: ${emailVal}\nالموضوع: ${subject}\nالرسالة: ${message}`
                  window.open(`https://wa.me/${WHATSAPP_ORDER_PHONE_E164}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
                }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    placeholder={t('Your Name', 'اسمك')}
                    style={{
                      background: 'rgba(182,136,94,0.07)',
                      border: '1px solid rgba(182,136,94,0.18)',
                      color: '#F5E6D8',
                    }}
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder={t('Your Email', 'بريدك الإلكتروني')}
                    style={{
                      background: 'rgba(182,136,94,0.07)',
                      border: '1px solid rgba(182,136,94,0.18)',
                      color: '#F5E6D8',
                    }}
                  />
                </div>
                <Input
                  name="subject"
                  placeholder={t('Subject', 'الموضوع')}
                  style={{
                    background: 'rgba(182,136,94,0.07)',
                    border: '1px solid rgba(182,136,94,0.18)',
                    color: '#F5E6D8',
                  }}
                />
                <Textarea
                  name="message"
                  placeholder={t('Your Message', 'رسالتك')}
                  rows={5}
                  className="resize-none"
                  style={{
                    background: 'rgba(182,136,94,0.07)',
                    border: '1px solid rgba(182,136,94,0.18)',
                    color: '#F5E6D8',
                  }}
                />
                <Button
                  type="submit"
                  className="w-full font-semibold tracking-wide transition-all duration-300"
                  size="lg"
                  style={{
                    background: 'linear-gradient(135deg, #B6885E 0%, #D6A373 100%)',
                    color: '#0B0806',
                    boxShadow: '0 4px 20px rgba(182,136,94,0.3)',
                  }}
                >
                  {t('Send Message', 'إرسال الرسالة')}
                </Button>
              </form>
            </div>
          </FadeUp>

        </div>
      </div>
    </SectionReveal>
  )
}
