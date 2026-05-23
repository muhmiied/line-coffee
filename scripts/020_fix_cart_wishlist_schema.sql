-- Line Coffee cart/wishlist schema repair
-- Run this file manually in Supabase SQL Editor if /api/cart or /api/wishlist
-- fails because the live database is missing compatibility columns/tables.
--
-- This script is intentionally non-destructive:
-- - no tables are dropped
-- - no columns are dropped
-- - no rows are deleted
-- - legacy carts / wishlists are preserved

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Keep an updated_at helper available for cart_items.
DO $$
BEGIN
  IF to_regprocedure('public.update_updated_at_column()') IS NULL THEN
    CREATE FUNCTION public.update_updated_at_column()
    RETURNS trigger AS $function$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $function$ LANGUAGE plpgsql;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- cart_items compatibility table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  product_id uuid NULL,
  quantity integer NOT NULL DEFAULT 1,
  size text NULL,
  client_item_id text NULL,
  name_en text NULL,
  name_ar text NULL,
  image text NULL,
  unit_price numeric NULL,
  customizations jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS product_id uuid NULL,
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS size text NULL,
  ADD COLUMN IF NOT EXISTS client_item_id text NULL,
  ADD COLUMN IF NOT EXISTS name_en text NULL,
  ADD COLUMN IF NOT EXISTS name_ar text NULL,
  ADD COLUMN IF NOT EXISTS image text NULL,
  ADD COLUMN IF NOT EXISTS unit_price numeric NULL,
  ADD COLUMN IF NOT EXISTS customizations jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_quantity_positive'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_quantity_positive
      CHECK (quantity > 0)
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conname = 'cart_items_user_id_fkey'
         AND conrelid = 'public.cart_items'::regclass
     )
  THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      NOT VALID;
  END IF;

  IF to_regclass('public.products') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conname = 'cart_items_product_id_fkey'
         AND conrelid = 'public.cart_items'::regclass
     )
  THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
      NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_client_item_id ON public.cart_items(client_item_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'cart_items_user_client_item_unique'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM public.cart_items
      WHERE user_id IS NOT NULL
        AND client_item_id IS NOT NULL
      GROUP BY user_id, client_item_id
      HAVING count(*) > 1
    ) THEN
      RAISE NOTICE 'Skipped cart_items_user_client_item_unique because duplicate rows already exist.';
    ELSE
      CREATE UNIQUE INDEX cart_items_user_client_item_unique
        ON public.cart_items(user_id, client_item_id)
        WHERE user_id IS NOT NULL AND client_item_id IS NOT NULL;
    END IF;
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Preserve any legacy cart rows by copying them into cart_items if they are
-- not already represented there. This does not delete or mutate legacy carts.
DO $$
BEGIN
  IF to_regclass('public.carts') IS NOT NULL THEN
    INSERT INTO public.cart_items (
      user_id,
      product_id,
      quantity,
      size,
      client_item_id,
      customizations,
      created_at,
      updated_at
    )
    SELECT
      carts.user_id,
      carts.product_id,
      COALESCE(carts.quantity, 1),
      carts.size,
      carts.product_id::text || '-' || COALESCE(carts.size, 'default'),
      '{}'::jsonb,
      carts.created_at,
      carts.updated_at
    FROM public.carts
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.cart_items ci
      WHERE ci.user_id = carts.user_id
        AND ci.product_id = carts.product_id
        AND COALESCE(ci.size, '') = COALESCE(carts.size, '')
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- wishlist_items compatibility table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  product_id uuid NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.wishlist_items
  ADD COLUMN IF NOT EXISTS user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS product_id uuid NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conname = 'wishlist_items_user_id_fkey'
         AND conrelid = 'public.wishlist_items'::regclass
     )
  THEN
    ALTER TABLE public.wishlist_items
      ADD CONSTRAINT wishlist_items_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      NOT VALID;
  END IF;

  IF to_regclass('public.products') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conname = 'wishlist_items_product_id_fkey'
         AND conrelid = 'public.wishlist_items'::regclass
     )
  THEN
    ALTER TABLE public.wishlist_items
      ADD CONSTRAINT wishlist_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
      NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'wishlist_items_user_product_unique'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM public.wishlist_items
      WHERE user_id IS NOT NULL
        AND product_id IS NOT NULL
      GROUP BY user_id, product_id
      HAVING count(*) > 1
    ) THEN
      RAISE NOTICE 'Skipped wishlist_items_user_product_unique because duplicate rows already exist.';
    ELSE
      CREATE UNIQUE INDEX wishlist_items_user_product_unique
        ON public.wishlist_items(user_id, product_id)
        WHERE user_id IS NOT NULL AND product_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Preserve legacy wishlists by copying rows into wishlist_items if missing.
DO $$
BEGIN
  IF to_regclass('public.wishlists') IS NOT NULL THEN
    INSERT INTO public.wishlist_items (user_id, product_id, created_at)
    SELECT wishlists.user_id, wishlists.product_id, wishlists.created_at
    FROM public.wishlists
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.wishlist_items wi
      WHERE wi.user_id = wishlists.user_id
        AND wi.product_id = wishlists.product_id
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Conservative RLS policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Users can read own cart items'
  ) THEN
    CREATE POLICY "Users can read own cart items"
      ON public.cart_items
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Users can insert own cart items'
  ) THEN
    CREATE POLICY "Users can insert own cart items"
      ON public.cart_items
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Users can update own cart items'
  ) THEN
    CREATE POLICY "Users can update own cart items"
      ON public.cart_items
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Users can delete own cart items'
  ) THEN
    CREATE POLICY "Users can delete own cart items"
      ON public.cart_items
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Service role can manage cart items'
  ) THEN
    CREATE POLICY "Service role can manage cart items"
      ON public.cart_items
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist_items'
      AND policyname = 'Users can read own wishlist items'
  ) THEN
    CREATE POLICY "Users can read own wishlist items"
      ON public.wishlist_items
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist_items'
      AND policyname = 'Users can insert own wishlist items'
  ) THEN
    CREATE POLICY "Users can insert own wishlist items"
      ON public.wishlist_items
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist_items'
      AND policyname = 'Users can delete own wishlist items'
  ) THEN
    CREATE POLICY "Users can delete own wishlist items"
      ON public.wishlist_items
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist_items'
      AND policyname = 'Service role can manage wishlist items'
  ) THEN
    CREATE POLICY "Service role can manage wishlist items"
      ON public.wishlist_items
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verification queries. These are safe to leave in the script when running in
-- Supabase SQL Editor.
SELECT 'cart/wishlist schema repair complete' AS status;

SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('cart_items', 'wishlist_items')
ORDER BY table_name, ordinal_position;

SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('cart_items', 'wishlist_items')
ORDER BY tablename, indexname;
