-- =============================================
-- Dashboard-focused schema additions
-- =============================================
-- This migration adds columns requested for admin/order workflows
-- without breaking the existing project schema.

-- Orders: requested fields for WhatsApp + dashboard listing
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS items JSONB;

-- Products: keep existing UUID id and add dashboard-friendly price columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_250 NUMERIC,
  ADD COLUMN IF NOT EXISTS price_500 NUMERIC,
  ADD COLUMN IF NOT EXISTS price_1000 NUMERIC;

-- Requested standalone table shape (created only if it does not exist)
CREATE TABLE IF NOT EXISTS public.products_dashboard (
  id TEXT PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  category_id TEXT,
  price_250 NUMERIC,
  price_500 NUMERIC,
  price_1000 NUMERIC,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

