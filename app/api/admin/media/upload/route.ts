import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'
import { MEDIA_ALLOWED_MIME_TYPES, MEDIA_BUCKET, MEDIA_MAX_UPLOAD_SIZE } from '@/lib/media'

async function guardAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return null
  return createAdminClient()
}

function extensionFromFile(file: File) {
  const byType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const fromType = byType[file.type]
  if (fromType) return fromType

  const fromName = file.name.split('.').pop()?.toLowerCase()
  return fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName) ? fromName : 'jpg'
}

function safeFolder(value: FormDataEntryValue | null) {
  return String(value || 'general')
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'general'
}

async function ensureMediaBucket(admin: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { data: buckets, error: listError } = await admin.storage.listBuckets()
  if (listError) throw listError

  if (buckets?.some((bucket) => bucket.name === MEDIA_BUCKET)) return

  const { error } = await admin.storage.createBucket(MEDIA_BUCKET, {
    public: true,
  })

  if (error && !/already exists/i.test(error.message)) throw error
}

export async function POST(request: Request) {
  const admin = await guardAdmin()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Image file is required' }, { status: 400 })
    }

    if (!MEDIA_ALLOWED_MIME_TYPES.includes(file.type as (typeof MEDIA_ALLOWED_MIME_TYPES)[number])) {
      return NextResponse.json({ success: false, error: 'Only JPG, PNG, and WebP images are allowed' }, { status: 400 })
    }

    if (file.size > MEDIA_MAX_UPLOAD_SIZE) {
      return NextResponse.json({ success: false, error: 'Image is too large. Maximum size is 8MB' }, { status: 400 })
    }

    await ensureMediaBucket(admin)

    const folder = safeFolder(formData.get('usage_area'))
    const ext = extensionFromFile(file)
    const path = `${folder}/${Date.now()}-${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from(MEDIA_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path)

    return NextResponse.json({
      success: true,
      data: {
        bucket: MEDIA_BUCKET,
        path,
        url: data.publicUrl,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    )
  }
}
