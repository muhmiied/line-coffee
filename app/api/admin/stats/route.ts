import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
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
    const { data } = await supabase
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

  const totalSales = allOrders.reduce((s, o) => s + Number(o.total || 0), 0)
  const totalOrders = allOrders.length

  const currentSales = currentPeriodOrders.reduce((s, o) => s + Number(o.total || 0), 0)
  const prevSales = prevPeriodOrders.reduce((s, o) => s + Number(o.total || 0), 0)
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
  currentPeriodOrders.forEach(o => {
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
    const { count } = await supabase
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
    const { data: orderItems } = await supabase
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
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    totalCustomers = count || 0

    const { count: currentCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgoISO)

    const { count: prevCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sixtyDaysAgoISO)
      .lt('created_at', thirtyDaysAgoISO)

    newThisMonth = currentCount || 0
    returningThisMonth = Math.max(0, (totalCustomers || 0) - (currentCount || 0))
    const cc = currentCount || 0
    const pc = prevCount || 0
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
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name_ar, name_en, image_url')
      .order('sort_order', { ascending: true })
      .limit(6)

    if (cats && cats.length > 0) {
      const catIds = cats.map(c => c.id)
      const { data: products } = await supabase
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
    const { data } = await supabase
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
