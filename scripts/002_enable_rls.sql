-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================
-- This script enables RLS and creates security policies for all tables.
-- RLS ensures users can only access their own data.
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- Users can only read/update their own profile
-- =============================================
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- =============================================
-- CATEGORIES POLICIES
-- Everyone can read visible categories
-- =============================================
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (is_visible = true);

-- =============================================
-- PRODUCTS POLICIES
-- Everyone can read visible products
-- =============================================
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (is_visible = true);

-- =============================================
-- PRODUCT SIZES POLICIES
-- Everyone can read product sizes
-- =============================================
CREATE POLICY "product_sizes_select_all" ON public.product_sizes
  FOR SELECT USING (true);

-- =============================================
-- ADDRESSES POLICIES
-- Users can only manage their own addresses
-- =============================================
CREATE POLICY "addresses_select_own" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "addresses_insert_own" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_own" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ORDERS POLICIES
-- Users can read their own orders, anyone can create orders (for guest checkout)
-- =============================================
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "orders_insert_all" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- ORDER ITEMS POLICIES
-- Users can read items from their own orders
-- =============================================
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "order_items_insert_all" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- =============================================
-- CART ITEMS POLICIES
-- Users can only manage their own cart
-- =============================================
CREATE POLICY "cart_items_select_own" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_own" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_own" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_own" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- WISHLIST POLICIES
-- Users can only manage their own wishlist
-- =============================================
CREATE POLICY "wishlist_select_own" ON public.wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist_insert_own" ON public.wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_delete_own" ON public.wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TESTIMONIALS POLICIES
-- Everyone can read visible testimonials
-- =============================================
CREATE POLICY "testimonials_select_all" ON public.testimonials
  FOR SELECT USING (is_visible = true);
