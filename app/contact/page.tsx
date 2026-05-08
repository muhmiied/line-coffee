'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/context/language'
import { toast } from 'sonner'

export default function ContactPage() {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success(t('Message sent successfully!', 'تم إرسال الرسالة بنجاح!'))
    setIsSubmitting(false)
    ;(e.target as HTMLFormElement).reset()
  }

  const contactInfo = [
    {
      icon: MapPin,
      labelEn: 'Address',
      labelAr: 'العنوان',
      valueEn: 'Cairo, Egypt',
      valueAr: 'القاهرة، مصر',
    },
    {
      icon: Phone,
      labelEn: 'Phone',
      labelAr: 'الهاتف',
      valueEn: '+20 100 000 0000',
      valueAr: '+20 100 000 0000',
      href: 'tel:+201000000000',
    },
    {
      icon: Mail,
      labelEn: 'Email',
      labelAr: 'البريد الإلكتروني',
      valueEn: 'hello@linecoffee.com.eg',
      valueAr: 'hello@linecoffee.com.eg',
      href: 'mailto:hello@linecoffee.com.eg',
    },
    {
      icon: MessageCircle,
      labelEn: 'WhatsApp',
      labelAr: 'واتساب',
      valueEn: '+20 100 000 0000',
      valueAr: '+20 100 000 0000',
      href: 'https://wa.me/201000000000',
    },
  ]

  return (
    <div className="min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            {t('Contact Us', 'تواصل معنا')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(
              'Have a question or feedback? We would love to hear from you.',
              'لديك سؤال أو ملاحظة؟ يسعدنا سماعك.'
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {contactInfo.map((item, index) => {
              const Icon = item.icon
              const content = (
                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t(item.labelEn, item.labelAr)}
                    </h3>
                    <p className="text-muted-foreground">
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
                  className="block transition-transform hover:scale-[1.02]"
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
            <div className="bg-card rounded-xl border border-border p-6 md:p-8">
              <h2 className="font-serif text-xl font-semibold mb-6">
                {t('Send us a Message', 'أرسل لنا رسالة')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('Name', 'الاسم')}
                    </label>
                    <Input
                      name="name"
                      required
                      placeholder={t('Your name', 'اسمك')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('Email', 'البريد الإلكتروني')}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder={t('your@email.com', 'بريدك@الإلكتروني.com')}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('Subject', 'الموضوع')}
                  </label>
                  <Input
                    name="subject"
                    required
                    placeholder={t('How can we help?', 'كيف يمكننا مساعدتك؟')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('Message', 'الرسالة')}
                  </label>
                  <Textarea
                    name="message"
                    required
                    rows={5}
                    placeholder={t('Your message...', 'رسالتك...')}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
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
