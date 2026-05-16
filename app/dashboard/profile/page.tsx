'use client'

import { useEffect, useState } from 'react'
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
  const { user, profile, refreshProfile, isSupabaseConfigured } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    locationLink: '',
    notes: '',
  })

  useEffect(() => {
    setFormData({
      firstName: profile?.first_name || user?.user_metadata?.first_name || '',
      lastName: profile?.last_name || user?.user_metadata?.last_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      locationLink: profile?.location_link || '',
      notes: profile?.notes || '',
    })
  }, [profile, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!isSupabaseConfigured) {
      setIsLoading(false)
      toast.error(t(
        'Profile saving needs Supabase configuration.',
        'حفظ الملف الشخصي يحتاج إلى إعداد Supabase.'
      ))
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          location_link: formData.locationLink.trim(),
          notes: formData.notes.trim(),
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update profile')
      }

      await refreshProfile()
      if (result.warning) {
        toast.warning(t(
          'Profile saved. Apply the latest migration to store your map link.',
          'تم حفظ الملف. طبّق آخر migration لحفظ رابط الخريطة.'
        ))
      } else {
        toast.success(t('Profile updated successfully!', 'تم تحديث الملف الشخصي بنجاح!'))
      }
    } catch {
      toast.error(t('Failed to update profile', 'فشل تحديث الملف الشخصي'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-8 pt-32 sm:pt-36 md:pt-40">
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
            className="space-y-6 bg-card rounded-xl border border-border p-4 sm:p-6"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {formData.firstName || formData.lastName ? (
                    `${formData.firstName?.charAt(0)}${formData.lastName?.charAt(0)}`
                  ) : (
                    <User className="h-7 w-7" />
                  )}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                <p className="truncate text-sm text-muted-foreground">{formData.email}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Name Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
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

            {/* Contact */}
            <div className="grid sm:grid-cols-2 gap-4">
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
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('City', 'المدينة')}</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
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
                />
              </div>
            </div>

            {/* Location Link */}
            <div className="space-y-2">
              <Label htmlFor="locationLink">
                {t('Google Maps Location Link', 'رابط الموقع على خرائط جوجل')}{' '}
                <span className="text-muted-foreground text-xs">({t('Optional', 'اختياري')})</span>
              </Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="locationLink"
                  name="locationLink"
                  type="url"
                  placeholder={t('Paste your Google Maps link', 'أضف رابط خرائط جوجل')}
                  value={formData.locationLink}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                {t('Delivery Notes', 'ملاحظات التوصيل')}{' '}
                <span className="text-muted-foreground text-xs">({t('Optional', 'اختياري')})</span>
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder={t('Building, floor, landmark, or delivery preferences', 'العمارة، الدور، علامة مميزة أو ملاحظات التوصيل')}
                value={formData.notes}
                onChange={handleChange}
                className="resize-none"
                rows={3}
              />
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
