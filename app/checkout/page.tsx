'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  User,
  Mail,
  CheckCircle2,
  Loader2,
  Tag,
  X,
  LogIn,
  MessageSquare,
  Wallet,
  Banknote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { useAuth } from '@/lib/context/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function CheckoutPage() {
  const { t, language, dir } = useLanguage()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { items, getTotal, clearCart } = useCartStore()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [whatsAppUrl, setWhatsAppUrl] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Promo code state
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState<{
    code: string
    type: 'percentage' | 'fixed'
    value: number
    discount_amount: number
  } | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'cod',
  })

  // Autofill from authenticated user profile (including address/city)
  useEffect(() => {
    if (!user && !profile) return
    setFormData(prev => ({
      ...prev,
      email: user?.email || prev.email,
      firstName: profile?.first_name || prev.firstName,
      lastName: profile?.last_name || prev.lastName,
      phone: profile?.phone || prev.phone,
      address: profile?.address || prev.address,
      city: profile?.city || prev.city,
    }))
  }, [user, profile])

  const subtotal = getTotal()
  const shipping = subtotal >= 200 ? 0 : 25
  const discountAmount = promoApplied?.discount_amount || 0
  const total = Math.max(0, subtotal + shipping - discountAmount)

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch(`/api/discounts/validate?code=${encodeURIComponent(promoCode.trim())}`)
      const json = await res.json()
      if (!json.valid) {
        setPromoError(t(json.error || 'Invalid code', json.error || 'كود غير صحيح'))
        setPromoApplied(null)
        return
      }
      if (json.min_order && subtotal < json.min_order) {
        setPromoError(t(
          `Minimum order is ${json.min_order} EGP`,
          `الحد الأدنى للطلب ${json.min_order} ج.م`
        ))
        setPromoApplied(null)
        return
      }
      const discount_amount =
        json.type === 'percentage'
          ? Math.round((subtotal * json.value) / 100)
          : Math.min(json.value, subtotal)
      setPromoApplied({ code: json.code, type: json.type, value: json.value, discount_amount })
      setPromoError('')
    } catch {
      setPromoError(t('Failed to validate code', 'فشل التحقق من الكود'))
    } finally {
      setPromoLoading(false)
    }
  }

  const removePromo = () => {
    setPromoApplied(null)
    setPromoCode('')
    setPromoError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      redirectToLogin()
      return
    }

    const errors: Record<string, string> = {}
    if (!formData.firstName.trim()) errors.firstName = t('Please enter your first name', 'من فضلك ادخل اسمك الأول')
    if (!formData.lastName.trim()) errors.lastName = t('Please enter your last name', 'من فضلك ادخل اسمك الأخير')
    if (!formData.phone.trim()) errors.phone = t('Please enter your phone number', 'من فضلك ادخل رقم تليفونك')
    if (!formData.address.trim()) errors.address = t('Please enter your address', 'من فضلك ادخل عنوانك')
    if (!formData.city.trim()) errors.city = t('Please enter your city', 'من فضلك ادخل مدينتك')

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    if (items.length === 0) {
      toast.error(t('Your cart is empty', 'سلتك فارغة'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.product_id,
            product_name: language === 'ar' ? item.name_ar : item.name_en,
            product_image: item.image,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          })),
          subtotal,
          shipping_cost: shipping,
          discount_code: promoApplied?.code || null,
          discount_amount: promoApplied?.discount_amount || 0,
          total,
          notes: formData.notes || null,
          shipping_address: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
          },
          payment_method: formData.paymentMethod,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setOrderNumber(data.order.order_number)
        setOrderStatus(data.order.status || 'pending')
        setWhatsAppUrl(data.whatsapp_url || '')
        setOrderPlaced(true)
        clearCart()
        toast.success(t('Order placed successfully!', 'تم تأكيد الطلب بنجاح!'))
      } else {
        toast.error(data.error || t('Failed to place order', 'فشل في إنشاء الطلب'))
      }
    } catch {
      toast.error(t('Failed to place order', 'فشل في إنشاء الطلب'))
    } finally {
      setIsLoading(false)
    }
  }

  const redirectToLogin = () => {
    toast.error(t('Please login to complete your order', 'من فضلك سجل الدخول لإتمام الطلب'))
    router.push('/auth/login?next=/checkout')
  }

  // ── Order Success Screen ──────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-4">
            {t('Order Confirmed!', 'تم تأكيد الطلب!')}
          </h1>
          <p className="text-muted-foreground mb-2">
            {t('Thank you for your order', 'شكراً لطلبك')}
          </p>
          <p className="text-lg font-semibold text-primary mb-2">
            {t('Order Number:', 'رقم الطلب:')} {orderNumber}
          </p>
          <p className="text-sm font-medium text-muted-foreground mb-6">
            {t('Status:', 'الحالة:')} {orderStatus || 'pending'}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {t(
              'Your order was created in the website. You can optionally send the order details via WhatsApp.',
              'تم إنشاء طلبك داخل الموقع. يمكنك اختيارياً إرسال تفاصيل الطلب عبر واتساب.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {whatsAppUrl && (
              <Button asChild variant="secondary">
                <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                  {t('Send via WhatsApp', 'إرسال عبر واتساب')}
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href="/products">{t('Continue Shopping', 'متابعة التسوق')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">{t('My Orders', 'طلباتي')}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Empty Cart ────────────────────────────────────────────────
  if (items.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-2">
            {t('Your cart is empty', 'سلتك فارغة')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('Add some products to checkout', 'أضف بعض المنتجات للمتابعة')}
          </p>
          <Button asChild>
            <Link href="/products">{t('Browse Products', 'تصفح المنتجات')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const paymentMethods = [
    {
      value: 'cod',
      label: t('Cash on Delivery', 'الدفع عند الاستلام'),
      description: t('Pay when you receive your order', 'ادفع عند استلام طلبك'),
      icon: Banknote,
    },
    {
      value: 'electronic_wallet',
      label: t('Electronic Wallet', 'محفظة إلكترونية'),
      description: t('Pay via Vodafone Cash or any e-wallet', 'ادفع عبر فودافون كاش أو أي محفظة إلكترونية'),
      icon: Wallet,
    },
    {
      value: 'instapay',
      label: t('InstaPay', 'إنستاباي'),
      description: t('Pay via InstaPay', 'ادفع عبر إنستاباي'),
      icon: CreditCard,
    },
  ]

  return (
    <div className="min-h-screen py-8 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/products">
              {dir === 'rtl' ? (
                <ArrowRight className="w-4 h-4 mr-2" />
              ) : (
                <ArrowLeft className="w-4 h-4 mr-2" />
              )}
              {t('Continue Shopping', 'متابعة التسوق')}
            </Link>
          </Button>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">
            {t('Checkout', 'إتمام الطلب')}
          </h1>
        </div>

        {/* Login required prompt */}
        {!authLoading && !user && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/35 bg-primary/10 p-4 sm:flex-row sm:items-center">
            <LogIn className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground flex-1">
              {t(
                'Please login to complete your order. Orders are now account-only for your privacy and tracking.',
                'من فضلك سجل الدخول لإتمام طلبك. الطلبات مرتبطة بالحساب لحماية بياناتك وتتبع الطلب.'
              )}
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/auth/login?next=/checkout">
                  {t('Login', 'تسجيل الدخول')}
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/auth/signup?next=/checkout">
                  {t('Sign Up', 'إنشاء حساب')}
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t('Contact Information', 'معلومات الاتصال')}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('First Name', 'الاسم الأول')} *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={fieldErrors.firstName ? 'border-destructive' : ''}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-destructive text-xs mt-1">{fieldErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('Last Name', 'الاسم الأخير')} *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={fieldErrors.lastName ? 'border-destructive' : ''}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-destructive text-xs mt-1">{fieldErrors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">
                      <Mail className="w-3.5 h-3.5 inline mr-1" />
                      {t('Email', 'البريد الإلكتروني')}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      <Phone className="w-3.5 h-3.5 inline mr-1" />
                      {t('Phone', 'رقم الهاتف')} *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={fieldErrors.phone ? 'border-destructive' : ''}
                    />
                    {fieldErrors.phone && (
                      <p className="text-destructive text-xs mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {t('Shipping Address', 'عنوان الشحن')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">{t('Address', 'العنوان')} *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={t('Street address, building, apartment', 'الشارع، المبنى، الشقة')}
                      className={fieldErrors.address ? 'border-destructive' : ''}
                    />
                    {fieldErrors.address && (
                      <p className="text-destructive text-xs mt-1">{fieldErrors.address}</p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t('City', 'المدينة')} *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={fieldErrors.city ? 'border-destructive' : ''}
                      />
                      {fieldErrors.city && (
                        <p className="text-destructive text-xs mt-1">{fieldErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postalCode">{t('Postal Code', 'الرمز البريدي')}</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {t('Order Notes', 'ملاحظات الطلب')}
                </h2>
                <div>
                  <Label htmlFor="notes">{t('Notes (optional)', 'ملاحظات (اختياري)')}</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder={t(
                      'Any special instructions for your order...',
                      'أي تعليمات خاصة لطلبك...'
                    )}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  {t('Payment Method', 'طريقة الدفع')}
                </h2>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, paymentMethod: value }))
                  }
                  className="space-y-3"
                >
                  {paymentMethods.map(method => (
                    <div
                      key={method.value}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                        formData.paymentMethod === method.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <RadioGroupItem value={method.value} id={method.value} />
                      <method.icon className="w-5 h-5 text-muted-foreground shrink-0" />
                      <Label htmlFor={method.value} className="flex-1 cursor-pointer">
                        <span className="font-medium">{method.label}</span>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Submit — Mobile */}
              <div className="lg:hidden">
                <Button
                  type={user ? 'submit' : 'button'}
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                  onClick={!user ? redirectToLogin : undefined}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('Processing...', 'جاري المعالجة...')}
                    </>
                  ) : (
                    user
                      ? `${t('Place Order', 'تأكيد الطلب')} — ${total} ${t('EGP', 'ج.م')}`
                      : t('Login to Complete Order', 'سجل الدخول لإتمام الطلب')
                  )}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                {t('Order Summary', 'ملخص الطلب')} ({items.length}{' '}
                {t('items', 'عناصر')})
              </h2>

              {/* Items */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={language === 'ar' ? item.name_ar : item.name_en}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {language === 'ar' ? item.name_ar : item.name_en}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.size} × {item.quantity}
                      </p>
                      <p className="text-sm font-semibold">
                        {item.price * item.quantity} {t('EGP', 'ج.م')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t border-border pt-4 mb-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-primary" />
                  {t('Promo Code', 'كود الخصم')}
                </p>
                {promoApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-green-700 font-semibold text-sm font-mono">
                        {promoApplied.code}
                      </p>
                      <p className="text-green-600 text-xs">
                        {t(
                          `Saving ${promoApplied.discount_amount} EGP`,
                          `وفرت ${promoApplied.discount_amount} ج.م`
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removePromo}
                      aria-label={t('Remove', 'إزالة')}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={e => {
                        setPromoCode(e.target.value.toUpperCase())
                        setPromoError('')
                      }}
                      onKeyDown={e => e.key === 'Enter' && applyPromo()}
                      placeholder={t('Enter code', 'أدخل الكود')}
                      className="flex-1 border border-border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {promoLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t('Apply', 'تطبيق')
                      )}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-destructive text-xs mt-1">{promoError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Subtotal', 'المجموع الفرعي')}</span>
                  <span>
                    {subtotal} {t('EGP', 'ج.م')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {t('Shipping', 'الشحن')}
                  </span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">{t('Free', 'مجاني')}</span>
                    ) : (
                      `${shipping} ${t('EGP', 'ج.م')}`
                    )}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {promoApplied.code}
                    </span>
                    <span>
                      - {promoApplied.discount_amount} {t('EGP', 'ج.م')}
                    </span>
                  </div>
                )}
                {subtotal < 200 && (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      `Add ${200 - subtotal} EGP more for free shipping`,
                      `أضف ${200 - subtotal} ج.م للشحن المجاني`
                    )}
                  </p>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>{t('Total', 'الإجمالي')}</span>
                  <span className="text-primary">
                    {total} {t('EGP', 'ج.م')}
                  </span>
                </div>
              </div>

              {/* Submit — Desktop */}
              <div className="hidden lg:block mt-6">
                <Button
                  type={user ? 'submit' : 'button'}
                  form="checkout-form"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                  onClick={!user ? redirectToLogin : undefined}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('Processing...', 'جاري المعالجة...')}
                    </>
                  ) : (
                    user ? t('Place Order', 'تأكيد الطلب') : t('Login to Complete Order', 'سجل الدخول لإتمام الطلب')
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                {t(
                  'Your order information is secure and encrypted',
                  'معلومات طلبك آمنة ومشفرة'
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
