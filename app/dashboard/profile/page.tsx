'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Mail, Phone, MapPin, Link2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/context/language'
import { useAuth } from '@/lib/context/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { t, dir } = useLanguage()
  const { profile, refreshProfile, isSupabaseConfigured } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || 'Ahmed',
    lastName: profile?.last_name || 'Hassan',
    email: 'ahmed@example.com',
    phone: profile?.phone || '+20 100 000 0000',
    whatsapp: '+20 100 000 0000',
    address: 'Cairo, Egypt',
    locationLink: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate save for demo
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setIsLoading(false)
        toast.success(t('Profile updated successfully!', 'تم تحديث الملف الشخصي بنجاح!'))
      }, 1000)
      return
    }

    try {
      // Actual profile update would go here
      await refreshProfile()
      toast.success(t('Profile updated successfully!', 'تم تحديث الملف الشخصي بنجاح!'))
    } catch {
      toast.error(t('Failed to update profile', 'فشل تحديث الملف الشخصي'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className={cn('h-4 w-4 mr-2', dir === 'rtl' && 'rotate-180')} />
            {t('Back to Dashboard', 'العودة للوحة التحكم')}
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-serif text-3xl font-bold mb-2">
              {t('Edit Profile', 'تعديل الملف الشخصي')}
            </h1>
            <p className="text-muted-foreground">
              {t('Update your personal information', 'قم بتحديث معلوماتك الشخصية')}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-card rounded-xl border border-border p-6"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('First Name', 'الاسم الأول')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('Last Name', 'الاسم الأخير')}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('Email', 'البريد الإلكتروني')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  className="pl-10 bg-secondary/50"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('Email cannot be changed', 'لا يمكن تغيير البريد الإلكتروني')}
              </p>
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('Phone Number', 'رقم الهاتف')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t('WhatsApp Number', 'رقم الواتساب')}</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t('Address', 'العنوان')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 resize-none"
                  rows={2}
                  required
                />
              </div>
            </div>

            {/* Location Link */}
            <div className="space-y-2">
              <Label htmlFor="locationLink">
                {t('Location Link', 'رابط الموقع')}{' '}
                <span className="text-muted-foreground text-xs">({t('Optional', 'اختياري')})</span>
              </Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="locationLink"
                  name="locationLink"
                  type="url"
                  placeholder={t('Google Maps link', 'رابط خرائط جوجل')}
                  value={formData.locationLink}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('Save Changes', 'حفظ التغييرات')}
                </>
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  )
}
