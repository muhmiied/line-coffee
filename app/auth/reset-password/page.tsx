'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Lock, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/actions/auth.actions'
import { useLanguage } from '@/lib/context/language'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type PageState = 'loading' | 'ready' | 'invalid'

export default function ResetPasswordPage() {
  const { t, dir } = useLanguage()
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Handle implicit flow: Supabase sends access_token in URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready')
      }
    })

    // Handle PKCE flow: session already set by callback route
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState('ready')
      } else {
        // Wait briefly for PASSWORD_RECOVERY event from hash processing
        const timer = setTimeout(() => {
          setPageState((prev) => prev === 'loading' ? 'invalid' : prev)
        }, 1500)
        return () => clearTimeout(timer)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (password.length < 6) {
      toast.error(t('Password must be at least 6 characters', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'))
      return
    }

    if (password !== confirmPassword) {
      toast.error(t('Passwords do not match', 'كلمات المرور غير متطابقة'))
      return
    }

    setIsLoading(true)

    try {
      const result = await resetPassword(password)

      if (!result.success) {
        toast.error(result.error || t('Failed to reset password', 'فشل إعادة تعيين كلمة المرور'))
        return
      }

      // Sign out the recovery session so user must log in fresh
      const supabase = createClient()
      await supabase.auth.signOut()

      toast.success(t('Password updated successfully', 'تم تحديث كلمة المرور بنجاح'))
      router.replace('/auth/login')
    } catch {
      toast.error(t('Failed to reset password', 'فشل إعادة تعيين كلمة المرور'))
    } finally {
      setIsLoading(false)
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-6 flex justify-center">
            <Coffee className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-3">
            {t('Link Expired or Invalid', 'الرابط منتهي أو غير صالح')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t(
              'This password reset link is no longer valid. Please request a new one.',
              'رابط إعادة تعيين كلمة المرور هذا لم يعد صالحاً. يرجى طلب رابط جديد.'
            )}
          </p>
          <Button asChild>
            <Link href="/auth/forgot-password">
              {t('Request New Link', 'طلب رابط جديد')}
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-bold">
              <span className="text-primary">Line</span>
              <span className="text-foreground ml-1">Coffee</span>
            </span>
          </Link>
          <h1 className="font-serif text-2xl font-bold">
            {t('Reset Password', 'إعادة تعيين كلمة المرور')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('Create a new password for your Line Coffee account', 'أنشئ كلمة مرور جديدة لحسابك في Line Coffee')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">{t('New Password', 'كلمة المرور الجديدة')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('Enter your new password', 'أدخل كلمة المرور الجديدة')}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? t('Hide password', 'إخفاء كلمة المرور') : t('Show password', 'إظهار كلمة المرور')}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('Confirm Password', 'تأكيد كلمة المرور')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t('Confirm your new password', 'أكد كلمة المرور الجديدة')}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              t('Update Password', 'تحديث كلمة المرور')
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className={cn('h-4 w-4', dir === 'rtl' && 'rotate-180')} />
            {t('Back to Login', 'العودة لتسجيل الدخول')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
