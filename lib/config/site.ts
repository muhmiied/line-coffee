export const ADMIN_EMAIL = 'm.sayed@abu-elhassan.com'
export const CONTACT_PHONE = '01004761171'
export const CONTACT_EMAIL = 'm.sayed@abu-elhassan.com'
export const WHATSAPP_ORDER_PHONE_E164 = '201004761171'

export function isAdminEmail(email?: string | null) {
  return (email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

