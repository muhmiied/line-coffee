import { createClient } from '@/lib/supabase/server'
import type { CartItem, CartItemWithProduct, Product, ProductSize } from '@/lib/types/database'

type StoreCartItem = {
  id: string
  product_id: string
  name_en: string
  name_ar: string
  size: '250g' | '500g' | '1kg'
  price: number
  quantity: number
  image: string
  customizations?: Record<string, unknown>
}

type CartRow = CartItem & {
  client_item_id?: string | null
  name_en?: string | null
  name_ar?: string | null
  image?: string | null
  unit_price?: number | null
  customizations?: Record<string, unknown> | null
  product?: (Product & { sizes?: ProductSize[] }) | null
  product_size?: ProductSize | null
}

interface AddToCartData {
  userId: string
  productId: string
  size: string
  quantity: number
  clientItemId?: string
  name_en?: string
  name_ar?: string
  price?: number
  image?: string
  customizations?: Record<string, unknown> | null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string | null | undefined) {
  return Boolean(value && UUID_RE.test(value))
}

function getProductSize(row: CartRow) {
  const sizes = row.product?.sizes
  if (!Array.isArray(sizes)) return row.product_size ?? null
  return sizes.find((size) => size.size === row.size) ?? sizes[0] ?? null
}

export function mapCartItemToStoreItem(row: CartRow): StoreCartItem {
  const productSize = getProductSize(row)
  const productImage = row.product?.images?.[0] ?? ''

  return {
    id: row.client_item_id || row.id,
    product_id: row.product_id || row.client_item_id || row.id,
    name_en: row.name_en || row.product?.name_en || 'Custom Coffee',
    name_ar: row.name_ar || row.product?.name_ar || 'قهوة مخصصة',
    size: (row.size as StoreCartItem['size']) || '250g',
    price: Number(row.unit_price ?? productSize?.price ?? 0),
    quantity: Number(row.quantity || 1),
    image: row.image || productImage,
    customizations: row.customizations ?? undefined,
  }
}

export async function getCartItems(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(
        *,
        category:categories(*),
        sizes:product_sizes(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cart items:', error)
    throw new Error(error.message)
  }

  const rows = (data ?? []) as CartRow[]
  return rows.map((row) => ({ ...row, product_size: getProductSize(row) })) as CartItemWithProduct[]
}

export async function getStoreCartItems(userId: string) {
  const items = (await getCartItems(userId)) as unknown as CartRow[]
  return items.map(mapCartItemToStoreItem)
}

async function findExistingCartItem(data: AddToCartData) {
  const supabase = await createClient()
  const clientItemId = data.clientItemId || data.productId

  if (clientItemId) {
    const { data: existingByClientId } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', data.userId)
      .eq('client_item_id', clientItemId)
      .maybeSingle()

    if (existingByClientId) return existingByClientId as CartRow
  }

  if (isUuid(data.productId)) {
    const { data: existingByProduct } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', data.userId)
      .eq('product_id', data.productId)
      .eq('size', data.size)
      .maybeSingle()

    if (existingByProduct) return existingByProduct as CartRow
  }

  return null
}

export async function addToCart(data: AddToCartData) {
  const supabase = await createClient()
  const clientItemId = data.clientItemId || data.productId
  const existingItem = await findExistingCartItem(data)

  const payload = {
    client_item_id: clientItemId,
    name_en: data.name_en ?? null,
    name_ar: data.name_ar ?? null,
    image: data.image ?? null,
    unit_price: typeof data.price === 'number' ? data.price : null,
    customizations: data.customizations ?? null,
  }

  if (existingItem) {
    const { data: updated, error } = await supabase
      .from('cart_items')
      .update({
        ...payload,
        quantity: Number(existingItem.quantity || 0) + Number(data.quantity || 1),
      })
      .eq('id', existingItem.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cart item:', error)
      throw new Error(error.message)
    }

    return updated as CartItem
  }

  const { data: newItem, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: data.userId,
      product_id: isUuid(data.productId) ? data.productId : null,
      size: data.size,
      quantity: data.quantity,
      ...payload,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding to cart:', error)
    throw new Error(error.message)
  }

  return newItem as CartItem
}

export async function mergeCartItems(userId: string, items: StoreCartItem[]) {
  for (const item of items) {
    await addToCart({
      userId,
      productId: item.product_id,
      clientItemId: item.id,
      size: item.size,
      quantity: item.quantity,
      name_en: item.name_en,
      name_ar: item.name_ar,
      price: item.price,
      image: item.image,
      customizations: item.customizations ?? null,
    })
  }

  return getStoreCartItems(userId)
}

export async function updateCartItem(itemId: string, userId: string, quantity: number) {
  const supabase = await createClient()

  if (quantity <= 0) {
    return removeFromCart(itemId, userId)
  }

  let query = supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)

  query = isUuid(itemId) ? query.eq('id', itemId) : query.eq('client_item_id', itemId)

  const { data, error } = await query.select().single()

  if (error) {
    console.error('Error updating cart item:', error)
    throw new Error(error.message)
  }

  return data as CartItem
}

export async function removeFromCart(itemId: string, userId: string) {
  const supabase = await createClient()

  let query = supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  query = isUuid(itemId) ? query.eq('id', itemId) : query.eq('client_item_id', itemId)

  const { error } = await query

  if (error) {
    console.error('Error removing from cart:', error)
    throw new Error(error.message)
  }

  return { success: true }
}

export async function clearCart(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error clearing cart:', error)
    throw new Error(error.message)
  }

  return { success: true }
}

export async function getCartCount(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', userId)

  if (error) {
    console.error('Error getting cart count:', error)
    return 0
  }

  return (data ?? []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}

export async function getCartTotal(userId: string) {
  const items = (await getCartItems(userId)) as unknown as CartRow[]

  const subtotal = items.reduce((sum, item) => {
    const productSize = getProductSize(item)
    const price = Number(item.unit_price ?? productSize?.price ?? 0)
    return sum + price * Number(item.quantity || 0)
  }, 0)

  return {
    subtotal,
    itemsCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  }
}
