'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, Edit, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { useAuth } from '@/lib/context/auth'
import { cn } from '@/lib/utils'
import { ADMIN_EMAIL } from '@/lib/config/site'

const menuItems = [
  { 
    id: 'profile', 
    icon: User, 
    labelEn: 'My Profile', 
    labelAr: 'ملفي الشخصي',
    href: '/dashboard/profile',
  },
  { 
    id: 'orders', 
    icon: Package, 
    labelEn: 'My Orders', 
    labelAr: 'طلباتي',
    href: '/dashboard/orders',
  },
  { 
    id: 'wishlist', 
    icon: Heart, 
    labelEn: 'Wishlist', 
    labelAr: 'المفضلة',
    href: '/dashboard/wishlist',
  },
  { 
    id: 'addresses', 
    icon: MapPin, 
    labelEn: 'Addresses', 
    labelAr: 'العناوين',
    href: '/dashboard/addresses',
  },
  { 
    id: 'settings', 
    icon: Settings, 
    labelEn: 'Settings', 
    labelAr: 'الإعدادات',
    href: '/dashboard/settings',
  },
]

export default function DashboardPage() {
  const { t, dir } = useLanguage()
  const { user, profile, signOut, isLoading } = useAuth()
  const router = useRouter()
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [isLoading, user, router])

  const firstName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'
  const lastName = profile?.last_name || user?.user_metadata?.last_name || ''
  const displayEmail = user?.email || ''

  const displayProfile = {
    firstName,
    lastName,
    email: displayEmail,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-serif text-3xl font-bold mb-2">
              {t('My Account', 'حسابي')}
            </h1>
            <p className="text-muted-foreground">
              {t('Welcome back,', 'مرحباً بعودتك،')} {firstName}!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-1"
            >
              <div className="bg-card rounded-xl border border-border p-6">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {displayProfile.firstName?.charAt(0)}{displayProfile.lastName?.charAt(0)}
                    </span>
                  </div>
                  <h2 className="font-semibold text-lg">
                    {displayProfile.firstName}{displayProfile.lastName ? ` ${displayProfile.lastName}` : ''}
                  </h2>
                  <p className="text-sm text-muted-foreground">{displayProfile.email}</p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/profile">
                      <Edit className="h-4 w-4 mr-2" />
                      {t('Edit Profile', 'تعديل الملف الشخصي')}
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('Sign Out', 'تسجيل الخروج')}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2"
            >
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors',
                      index !== menuItems.length - 1 && 'border-b border-border'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{t(item.labelEn, item.labelAr)}</span>
                    </div>
                    <ChevronRight className={cn('h-5 w-5 text-muted-foreground', dir === 'rtl' && 'rotate-180')} />
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-t border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{t('Admin Dashboard', 'لوحة تحكم الأدمن')}</span>
                    </div>
                    <ChevronRight className={cn('h-5 w-5 text-muted-foreground', dir === 'rtl' && 'rotate-180')} />
                  </Link>
                )}
              </div>

              {/* Recent Orders Preview */}
              <div className="mt-8 bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{t('Recent Orders', 'الطلبات الأخيرة')}</h3>
                  <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
                    {t('View All', 'عرض الكل')}
                  </Link>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{t('No orders yet', 'لا توجد طلبات بعد')}</p>
                  <Button asChild className="mt-4">
                    <Link href="/products">{t('Start Shopping', 'ابدأ التسوق')}</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
