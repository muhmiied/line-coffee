'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Coffee, User, Phone, MapPin, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/context/language'
import { useAuth } from '@/lib/context/auth'
import { signUp } from '@/lib/actions/auth.actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const { t, dir } = useLanguage()
  const { isSupabaseConfigured } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsapp: '',
    address: '',
    locationLink: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('Passwords do not match', 'كلمات المرور غير متطابقة'))
      return
    }

    if (formData.password.length < 6) {
      toast.error(t('Password must be at least 6 characters', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'))
      return
    }

    setIsLoading(true)

    if (!isSupabaseConfigured) {
      toast.info(t('Demo mode - Supabase not configured', 'وضع تجريبي - Supabase غير مُعَد'))
      setIsLoading(false)
      return
    }

    try {
      const result = await signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address,
        locationLink: formData.locationLink,
      })

      if (!result.success) {
        if (
          /already registered|already exists|duplicate/i.test(result.error || '')
        ) {
          toast.error(t('This email is already registered.', 'هذا البريد الإلكتروني مسجل بالفعل.'))
          return
        }
        throw new Error(result.error)
      }

      if (result.requiresEmailConfirmation) {
        toast.success(
          t(
            'Account created successfully! Please check your email to confirm your account.',
            'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.'
          )
        )
        router.push('/auth/login?message=check-email')
      } else {
        toast.success(t('Account created successfully!', 'تم إنشاء الحساب بنجاح!'))
        router.replace('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error(t('Signup failed. Email may already be in use.', 'فشل التسجيل. البريد الإلكتروني قد يكون مستخدماً.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-bold">
              <span className="text-primary">Line</span>
              <span className="text-foreground ml-1">Coffee</span>
            </span>
          </Link>
          <h1 className="font-serif text-2xl font-bold mt-6">
            {t('Create Account', 'إنشاء حساب')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('Join our coffee community today', 'انضم إلى مجتمع القهوة لدينا اليوم')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder={t('First name', 'الاسم الأول')}
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
                placeholder={t('Last name', 'الاسم الأخير')}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('Email', 'البريد الإلكتروني')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('Enter your email', 'أدخل بريدك الإلكتروني')}
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
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
                  placeholder={t('+20 100 000 0000', '+20 100 000 0000')}
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
                placeholder={t('+20 100 000 0000', '+20 100 000 0000')}
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
                placeholder={t('Enter your full address', 'أدخل عنوانك الكامل')}
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

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('Password', 'كلمة المرور')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('Create a password', 'أنشئ كلمة مرور')}
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('Confirm Password', 'تأكيد كلمة المرور')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t('Confirm your password', 'أكد كلمة المرور')}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {t('Create Account', 'إنشاء حساب')}
                <ArrowRight className={cn('h-4 w-4', dir === 'rtl' && 'rotate-180')} />
              </>
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          {t('Already have an account?', 'لديك حساب بالفعل؟')}{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            {t('Sign in', 'سجل دخولك')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
