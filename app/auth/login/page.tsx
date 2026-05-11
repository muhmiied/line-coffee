'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/lib/context/language'
import { signIn } from '@/lib/actions/auth.actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ADMIN_EMAIL } from '@/lib/config/site'
import { sanitizeRedirectPath } from '@/lib/auth/redirect'

function LoginForm() {
  const { t, dir, language } = useLanguage()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const router = useRouter()
  const redirectTo = sanitizeRedirectPath(
    searchParams.get('next') ?? searchParams.get('redirect'),
    '/',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (message === 'check-email') {
      toast.info(
        language === 'ar'
          ? 'يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.'
          : 'Please check your email to confirm your account.',
      )
    }
  }, [language, message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn({ email, password })
      
      if (result.success) {
        toast.success(t('Login successful!', 'تم تسجيل الدخول بنجاح!'))
        const isAdmin = result.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        const dest = redirectTo === '/' && isAdmin ? '/dashboard/admin' : redirectTo
        router.replace(dest)
        router.refresh()
      } else {
        toast.error(result.error || t('Login failed. Please try again.', 'فشل تسجيل الدخول. حاول مرة أخرى.'))
      }
    } catch {
      toast.error(t('Login failed. Please try again.', 'فشل تسجيل الدخول. حاول مرة أخرى.'))
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
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold">
            {t('Welcome Back', 'مرحباً بعودتك')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('Sign in to your account to continue', 'سجل دخولك للمتابعة')}
          </p>
        </div>

        {/* Form */}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('Password', 'كلمة المرور')}</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t('Forgot password?', 'نسيت كلمة المرور؟')}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('Enter your password', 'أدخل كلمة المرور')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {t('Sign In', 'تسجيل الدخول')}
                <ArrowRight className={cn('h-4 w-4', dir === 'rtl' && 'rotate-180')} />
              </>
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
          <Link href="/auth/signup" className="text-primary font-medium hover:underline">
            {t('Sign up', 'سجل الآن')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
