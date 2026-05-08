'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Coffee, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/lib/context/language'
import { forgotPassword } from '@/lib/actions/auth.actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const { t, dir } = useLanguage()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await forgotPassword(email.trim().toLowerCase())
      if (result.success) {
        setSent(true)
      } else {
        toast.error(result.error || t('Something went wrong', 'حدث خطأ ما'))
      }
    } catch {
      toast.error(t('Something went wrong', 'حدث خطأ ما'))
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-3">
            {t('Check Your Email', 'تحقق من بريدك الإلكتروني')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t(
              `We sent a password reset link to ${email}`,
              `أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}`
            )}
          </p>
          <Button asChild variant="outline">
            <Link href="/auth/login">
              <ArrowLeft className={cn('h-4 w-4', dir === 'rtl' && 'rotate-180')} />
              {t('Back to Login', 'العودة لتسجيل الدخول')}
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-bold">
              <span className="text-primary">Line</span>
              <span className="text-foreground ml-1">Coffee</span>
            </span>
          </Link>
          <h1 className="font-serif text-2xl font-bold mt-6">
            {t('Forgot Password?', 'نسيت كلمة المرور؟')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t(
              "Enter your email and we'll send you a reset link",
              'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">{t('Email', 'البريد الإلكتروني')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t('Enter your email', 'أدخل بريدك الإلكتروني')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              t('Send Reset Link', 'إرسال رابط الإعادة')
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {t('Remember your password?', 'تتذكر كلمة مرورك؟')}{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            {t('Sign in', 'سجل دخولك')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
