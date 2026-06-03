export const ADMIN_EMAIL = 'm.sayed@abu-elhassan.com'
export const BRAND_SITE_NAME = 'Line Coffee'
export const BRAND_LOGO_URL = '/brand/logo-white.svg'
export const BRAND_LOGO_ALT = 'Line Coffee'
export const BRAND_FAVICON_URL = '/favicon.ico'
export const BRAND_TAGLINE = 'Premium coffee crafted for warm daily rituals.'
export const CONTACT_PHONE = '01004761171'
export const CONTACT_EMAIL = 'm.sayed@abu-elhassan.com'
export const CONTACT_ADDRESS_LINE_1 = 'Cairo, Egypt'
export const CONTACT_ADDRESS_LINE_2 = ''
export const CONTACT_CITY = ''
export const CONTACT_COUNTRY = ''
export const CONTACT_OPENING_HOURS = 'Sun - Thu: 9AM - 6PM'
export const WHATSAPP_ORDER_PHONE_E164 = '201004761171'
export const WHATSAPP_DISPLAY = '+20 100 476 1171'
export const SOCIAL_FACEBOOK_URL = 'https://facebook.com/linecoffee'
export const SOCIAL_INSTAGRAM_URL = 'https://instagram.com/linecoffee.eg'
export const SOCIAL_TIKTOK_URL = ''
export const SOCIAL_YOUTUBE_URL = ''
export const FOOTER_BLURB =
  'Freshly roasted coffee crafted for warm daily rituals, from Turkish Blends to Espresso Blends and refined flavored favorites.'
export const SEO_DEFAULT_TITLE = 'Line Coffee | Premium Coffee in Egypt'
export const SEO_DEFAULT_DESCRIPTION =
  'Premium warm coffee in Egypt. Discover Turkish coffee, espresso blends, cappuccino, and hot chocolate.'
export const SEO_DEFAULT_KEYWORDS = 'coffee, Line Coffee, Egypt, Turkish coffee, espresso'
export const PRIVACY_POLICY_CONTENT =
  'This page is a temporary legal placeholder for Line Coffee. A complete policy can be published from the site content/legal CMS in a future phase.'
export const TERMS_OF_USE_CONTENT =
  'This page is a temporary legal placeholder for Line Coffee. Complete terms can be published from the site content/legal CMS in a future phase.'

export function isAdminEmail(email?: string | null) {
  return (email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()
}
