'use client'

import Link from 'next/link'
import { ArrowLeft, Edit, ExternalLink, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context/auth'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

export default function DashboardAddressesPage() {
  const { profile } = useAuth()
  const { t, dir } = useLanguage()

  const hasAddress = Boolean(profile?.address || profile?.city || profile?.location_link)

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
            <h1 className="font-serif text-3xl font-bold">{t('Addresses', 'العناوين')}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('Manage the delivery address used at checkout.', 'إدارة عنوان التوصيل المستخدم في الدفع.')}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex flex-col gap-4 min-[380px]:flex-row min-[380px]:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{t('Default delivery address', 'عنوان التوصيل الافتراضي')}</h2>
                {hasAddress ? (
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {profile?.address && <p>{profile.address}</p>}
                    {profile?.city && <p>{profile.city}</p>}
                    {profile?.location_link && (
                      <a
                        href={profile.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 break-all text-primary hover:underline"
                      >
                        {t('Open Google Maps location', 'افتح الموقع على خرائط جوجل')}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('No saved address yet.', 'لا يوجد عنوان محفوظ حتى الآن.')}
                  </p>
                )}
              </div>
            </div>

            <Button asChild className="mt-6">
              <Link href="/dashboard/profile">
                <Edit className="mr-2 h-4 w-4" />
                {hasAddress ? t('Edit Address', 'تعديل العنوان') : t('Add Address', 'إضافة عنوان')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
