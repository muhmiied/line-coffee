import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

export async function GET() {
  // Verify requesting user is admin via session cookie (ANON KEY)
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // Use service role to bypass RLS for all data queries
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })
  }

  // Date helpers
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString()
  const sixtyDaysAgoISO = sixtyDaysAgo.toISOString()

  // ── Orders ──────────────────────────────────────────────────────────────────
  let allOrders: Array<{
    id: string
    order_number: string
    status: string
    total: number
    created_at: string
    user_id: string | null
    shipping_address: { first_name?: string; last_name?: string } | null
  }> = []

  try {
    const { data } = await admin
      .from('orders')
      .select('id, order_number, status, total, created_at, user_id, shipping_address')
      .order('created_at', { ascending: false })
    allOrders = data || []
  } catch {
    allOrders = []
  }

  // Split orders into periods
  const currentPeriodOrders = allOrders.filter(o => new Date(o.created_at) >= thirtyDaysAgo)
  const prevPeriodOrders = allOrders.filter(o => {
    const d = new Date(o.created_at)
    return d >= sixtyDaysAgo && d < thirtyDaysAgo
  })

  // Only count confirmed/active orders in revenue (not pending/cancelled)
  const REVENUE_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered']
  const revenueOrders = allOrders.filter(o => REVENUE_STATUSES.includes(o.status))
  const totalSales = revenueOrders.reduce((s, o) => s + Number(o.total || 0), 0)
  const totalOrders = allOrders.length

  const currentSales = currentPeriodOrders.filter(o => REVENUE_STATUSES.includes(o.status)).reduce((s, o) => s + Number(o.total || 0), 0)
  const prevSales = prevPeriodOrders.filter(o => REVENUE_STATUSES.includes(o.status)).reduce((s, o) => s + Number(o.total || 0), 0)
  const salesChange = prevSales === 0 && currentSales === 0 ? 0 : prevSales === 0 ? 100 : Math.round(((currentSales - prevSales) / prevSales) * 100)

  const currentOrderCount = currentPeriodOrders.length
  const prevOrderCount = prevPeriodOrders.length
  const ordersChange = prevOrderCount === 0 && currentOrderCount === 0 ? 0 : prevOrderCount === 0 ? 100 : Math.round(((currentOrderCount - prevOrderCount) / prevOrderCount) * 100)

  // Recent 6 orders
  const recentOrders = allOrders.slice(0, 6)

  // Sales chart: last 30 days grouped by day
  const salesByDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    salesByDay[key] = 0
  }
  currentPeriodOrders.filter(o => REVENUE_STATUSES.includes(o.status)).forEach(o => {
    const key = o.created_at.slice(0, 10)
    if (key in salesByDay) {
      salesByDay[key] += Number(o.total || 0)
    }
  })
  const salesChart = Object.entries(salesByDay).map(([date, sales]) => ({
    date,
    label: new Date(date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
    sales,
  }))

  // ── Products ────────────────────────────────────────────────────────────────
  let totalProducts = 0
  try {
    const { count } = await admin
      .from('products')
      .select('*', { count: 'exact', head: true })
    totalProducts = count || 0
  } catch {
    totalProducts = 0
  }

  // Top products via order_items aggregation
  let topProducts: Array<{
    id: string
    name: string
    image: string | null
    price: number
    sold: number
  }> = []
  try {
    const { data: orderItems } = await admin
      .from('order_items')
      .select('product_id, product_name, product_image, unit_price, quantity')
      .gte('created_at', thirtyDaysAgoISO)

    if (orderItems && orderItems.length > 0) {
      const productMap: Record<string, { name: string; image: string | null; price: number; sold: number }> = {}
      orderItems.forEach(item => {
        const id = item.product_id || item.product_name
        if (!productMap[id]) {
          productMap[id] = {
            name: item.product_name,
            image: item.product_image,
            price: Number(item.unit_price || 0),
            sold: 0,
          }
        }
        productMap[id].sold += Number(item.quantity || 0)
      })
      topProducts = Object.entries(productMap)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5)
    }
  } catch {
    topProducts = []
  }

  // ── Customers / Profiles ─────────────────────────────────────────────────────
  let totalCustomers = 0
  let customersChange = 0
  let newThisMonth = 0
  let returningThisMonth = 0

  try {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    totalCustomers = users?.length || 0

    const currentUsers = (users || []).filter(u => new Date(u.created_at) >= thirtyDaysAgo)
    const prevUsers = (users || []).filter(u => {
      const d = new Date(u.created_at)
      return d >= sixtyDaysAgo && d < thirtyDaysAgo
    })

    newThisMonth = currentUsers.length
    returningThisMonth = Math.max(0, totalCustomers - newThisMonth)
    const cc = currentUsers.length
    const pc = prevUsers.length
    customersChange = cc === 0 && pc === 0 ? 0 : pc === 0 ? 100 : Math.round(((cc - pc) / pc) * 100)
  } catch {
    totalCustomers = 0
  }

  // ── Categories ───────────────────────────────────────────────────────────────
  let categories: Array<{
    id: string
    name: string
    image: string | null
    productCount: number
  }> = []

  try {
    const { data: cats } = await admin
      .from('categories')
      .select('id, name_ar, name_en, image_url')
      .order('sort_order', { ascending: true })
      .limit(6)

    if (cats && cats.length > 0) {
      const catIds = cats.map(c => c.id)
      const { data: products } = await admin
        .from('products')
        .select('category_id')
        .in('category_id', catIds)

      const countMap: Record<string, number> = {}
      catIds.forEach(id => { countMap[id] = 0 })
      ;(products || []).forEach(p => {
        if (p.category_id && countMap[p.category_id] !== undefined) {
          countMap[p.category_id]++
        }
      })

      categories = cats.map(c => ({
        id: c.id,
        name: c.name_ar || c.name_en,
        image: c.image_url,
        productCount: countMap[c.id] || 0,
      }))
    }
  } catch {
    categories = []
  }

  // ── Reviews / Testimonials ───────────────────────────────────────────────────
  let reviews: Array<{
    id: string
    customer_name: string
    content: string
    rating: number
    created_at: string
  }> = []

  try {
    const { data } = await admin
      .from('testimonials')
      .select('id, customer_name, content_ar, content_en, rating, created_at')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(3)

    reviews = (data || []).map(r => ({
      id: r.id,
      customer_name: r.customer_name,
      content: r.content_ar || r.content_en,
      rating: r.rating,
      created_at: r.created_at,
    }))
  } catch {
    reviews = []
  }

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        salesChange,
        ordersChange,
        customersChange,
      },
      salesChart,
      recentOrders,
      topProducts,
      categories,
      reviews,
      customers: {
        total: totalCustomers,
        newThisMonth,
        returningThisMonth,
      },
    },
  })
}
