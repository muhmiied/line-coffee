import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { WHATSAPP_ORDER_PHONE_E164 } from '@/lib/config/site'

const MAX_LENGTHS = {
  name: 120,
  email: 254,
  subject: 180,
  message: 5000,
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, '')
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isMissingTable(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || error?.message?.toLowerCase().includes('contact_messages')
}

function buildWhatsAppMessage(input: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return [
    'Line Coffee contact message',
    '',
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Subject: ${input.subject}`,
    '',
    'Message:',
    input.message,
  ].join('\n')
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Database service is not configured' },
      { status: 503 },
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Server database service role is not configured' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const payload = {
    name: clean((body as Record<string, unknown>)?.name),
    email: clean((body as Record<string, unknown>)?.email),
    subject: clean((body as Record<string, unknown>)?.subject),
    message: clean((body as Record<string, unknown>)?.message),
  }

  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    return NextResponse.json(
      { success: false, error: 'Name, email, subject and message are required' },
      { status: 400 },
    )
  }

  if (!isValidEmail(payload.email)) {
    return NextResponse.json({ success: false, error: 'Please enter a valid email' }, { status: 400 })
  }

  for (const [key, max] of Object.entries(MAX_LENGTHS)) {
    if (payload[key as keyof typeof payload].length > max) {
      return NextResponse.json(
        { success: false, error: `${key} is too long` },
        { status: 400 },
      )
    }
  }

  const { data, error } = await admin
    .from('contact_messages')
    .insert({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      status: 'unread',
    })
    .select('id, status, created_at')
    .single()

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { success: false, error: 'Contact messages table is not available. Apply the contact messages migration first.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const { data: settings } = await admin
    .from('site_settings')
    .select('key, value')
    .eq('key', 'wa_phone')
    .maybeSingle()

  const phone = normalizePhone(settings?.value || WHATSAPP_ORDER_PHONE_E164 || '')
  const whatsappMessage = buildWhatsAppMessage(payload)

  return NextResponse.json({
    success: true,
    data,
    whatsapp_configured: Boolean(phone),
    whatsapp_url: phone ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}` : null,
    message: phone
      ? 'Message saved. Opening WhatsApp...'
      : 'Message saved, but WhatsApp is not configured.',
  })
}
