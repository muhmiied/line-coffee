export type StockState = 'in_stock' | 'low_stock' | 'out_of_stock'

type StockProduct = {
  stock_quantity: number
  low_stock_threshold?: number | null
  is_manually_out_of_stock?: boolean | null
}

export function getStockState(product: StockProduct): StockState {
  if (product.is_manually_out_of_stock) return 'out_of_stock'
  if (product.stock_quantity <= 0) return 'out_of_stock'
  const threshold = product.low_stock_threshold ?? 10
  if (product.stock_quantity <= threshold) return 'low_stock'
  return 'in_stock'
}

export function isOutOfStock(product: StockProduct): boolean {
  return getStockState(product) === 'out_of_stock'
}

export function isLowStock(product: StockProduct): boolean {
  return getStockState(product) === 'low_stock'
}
