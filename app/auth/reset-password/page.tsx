'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/actions/auth.actions'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const { t, dir } = useLanguage()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

      toast.success(t('Password updated successfully', 'تم تحديث كلمة المرور بنجاح'))
      router.replace('/auth/login')
      router.refresh()
    } catch {
      toast.error(t('Failed to reset password', 'فشل إعادة تعيين كلمة المرور'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
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
                onClick={() => setShowPassword((value) => !value)}
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
