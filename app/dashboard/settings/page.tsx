'use client'

import Link from 'next/link'
import { ArrowLeft, Globe, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context/auth'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

export default function DashboardSettingsPage() {
  const { user, signOut } = useAuth()
  const { t, dir, language, setLanguage } = useLanguage()

  return (
    <div className="min-h-screen pb-8 pt-32 sm:pt-36 md:pt-40">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className={cn('mr-2 h-4 w-4', dir === 'rtl' && 'rotate-180')} />
            {t('Back to Dashboard', 'العودة للوحة التحكم')}
          </Link>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold">{t('Settings', 'الإعدادات')}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('Control your account preferences.', 'تحكم في تفضيلات حسابك.')}
            </p>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">{t('Language', 'اللغة')}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => setLanguage('en')}
                >
                  English
                </Button>
                <Button
                  type="button"
                  variant={language === 'ar' ? 'default' : 'outline'}
                  onClick={() => setLanguage('ar')}
                >
                  عربي
                </Button>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">{t('Account', 'الحساب')}</h2>
              </div>
              <p className="mb-4 break-all text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:flex-wrap">
                <Button asChild variant="outline">
                  <Link href="/dashboard/profile">{t('Edit Profile', 'تعديل الملف الشخصي')}</Link>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('Sign Out', 'تسجيل الخروج')}
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
