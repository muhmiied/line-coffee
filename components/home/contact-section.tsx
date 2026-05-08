'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/context/language'
import { SectionReveal, FadeUp, StaggerContainer, WordByWord } from '@/components/ui/motion-primitives'

export function ContactSection() {
  const { t } = useLanguage()

  return (
    <SectionReveal className="relative py-16 md:py-24 overflow-hidden">
      {/* Glass/Crystal gradient background - cream tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFDCC2] via-[#FFE8D6] to-[#FFDCC2]" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[#522500]/8 via-transparent to-[#522500]/5" />
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#522500]/10 to-transparent" />
      {/* Crystal shine effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <FadeUp>
            <p className="text-primary font-medium mb-2">
              {t('Get In Touch', 'تواصل معنا')}
            </p>
            <div className="font-serif text-3xl md:text-4xl font-bold mb-6">
              <WordByWord text={t('We\'d Love To Hear From You', 'نحب أن نسمع منك')} />
            </div>
            <p className="text-muted-foreground mb-8 max-w-md">
              {t(
                'Have a question about our products or want to place a bulk order? Reach out and we\'ll get back to you within 24 hours.',
                'لديك سؤال عن منتجاتنا أو تريد طلب كمية كبيرة؟ تواصل معنا وسنرد عليك خلال 24 ساعة.'
              )}
            </p>

            <StaggerContainer className="space-y-4">
              <FadeUp className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('Location', 'الموقع')}</p>
                  <p className="text-muted-foreground">
                    {t('Cairo, Egypt', 'القاهرة، مصر')}
                  </p>
                </div>
              </FadeUp>

              <FadeUp className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('Phone / WhatsApp', 'الهاتف / واتساب')}</p>
                  <a 
                    href="https://wa.me/201141262176" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +20 114 126 2176
                  </a>
                </div>
              </FadeUp>

              <FadeUp className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('Email', 'البريد الإلكتروني')}</p>
                  <a 
                    href="mailto:hello@linecoffee.com.eg" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    hello@linecoffee.com.eg
                  </a>
                </div>
              </FadeUp>

              <FadeUp className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('Working Hours', 'ساعات العمل')}</p>
                  <p className="text-muted-foreground">
                    {t('Sun - Thu: 9AM - 6PM', 'الأحد - الخميس: 9ص - 6م')}
                  </p>
                </div>
              </FadeUp>
            </StaggerContainer>
          </FadeUp>

          {/* Contact Form */}
          <FadeUp
            className="rounded-2xl p-6 md:p-8"
            style={{ backgroundColor: 'white', border: '1px solid rgba(82, 37, 0, 0.1)' }}
          >
            <h3 className="font-serif text-xl font-semibold mb-6">
              {t('Send Us a Message', 'أرسل لنا رسالة')}
            </h3>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder={t('Your Name', 'اسمك')}
                  className="bg-secondary/50"
                />
                <Input
                  type="email"
                  placeholder={t('Your Email', 'بريدك الإلكتروني')}
                  className="bg-secondary/50"
                />
              </div>
              <Input
                placeholder={t('Subject', 'الموضوع')}
                className="bg-secondary/50"
              />
              <Textarea
                placeholder={t('Your Message', 'رسالتك')}
                rows={5}
                className="bg-secondary/50 resize-none"
              />
              <Button type="submit" className="w-full" size="lg" style={{ backgroundColor: '#522500', color: '#FFDCC2' }}>
                {t('Send Message', 'إرسال الرسالة')}
              </Button>
            </form>
          </FadeUp>
        </div>
      </div>
    </SectionReveal>
  )
}
