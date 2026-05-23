-- Line Coffee schema reconciliation.
-- Safe, additive migration for schema drift between app code, migrations, and loose scripts.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Discounts: assigned email targeting used by admin/customer discount flows.
ALTER TABLE IF EXISTS public.discounts
  ADD COLUMN IF NOT EXISTS assigned_emails text[] NULL;

DO $$
BEGIN
  IF to_regclass('public.discounts') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_discounts_assigned_emails
      ON public.discounts USING gin (assigned_emails);
  END IF;
END $$;

-- 2. Site settings: used by announcement bar, WhatsApp settings, and customization APIs.
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS key text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.site_settings
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

UPDATE public.site_settings
SET id = gen_random_uuid()
WHERE id IS NULL;

UPDATE public.site_settings
SET key = 'setting-' || id::text
WHERE key IS NULL OR btrim(key) = '';

ALTER TABLE public.site_settings
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN key SET NOT NULL;

DO $$
DECLARE
  value_type text;
BEGIN
  SELECT data_type
    INTO value_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'site_settings'
    AND column_name = 'value';

  IF value_type IS NULL THEN
    ALTER TABLE public.site_settings
      ADD COLUMN value jsonb NOT NULL DEFAULT '{}'::jsonb;
  ELSIF value_type <> 'jsonb' THEN
    ALTER TABLE public.site_settings
      ALTER COLUMN value DROP DEFAULT;

    ALTER TABLE public.site_settings
      ALTER COLUMN value TYPE jsonb
      USING COALESCE(to_jsonb(value), '{}'::jsonb);

    ALTER TABLE public.site_settings
      ALTER COLUMN value SET DEFAULT '{}'::jsonb;
  END IF;

  UPDATE public.site_settings
  SET value = '{}'::jsonb
  WHERE value IS NULL;

  ALTER TABLE public.site_settings
    ALTER COLUMN value SET DEFAULT '{}'::jsonb,
    ALTER COLUMN value SET NOT NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.site_settings'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.site_settings
      ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'site_settings'
      AND i.indisunique
      AND pg_get_indexdef(i.indexrelid) ILIKE '%(key)%'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM public.site_settings
      GROUP BY key
      HAVING count(*) > 1
    ) THEN
      RAISE NOTICE 'Skipping unique index on site_settings(key): duplicate keys exist.';
    ELSE
      CREATE UNIQUE INDEX site_settings_key_unique
        ON public.site_settings (key);
    END IF;
  END IF;
END $$;

INSERT INTO public.site_settings (key, value)
SELECT 'announcement_bar', '{"active": true, "messages": []}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_settings WHERE key = 'announcement_bar'
);

INSERT INTO public.site_settings (key, value)
SELECT 'whatsapp_notifications', '{"enabled": false}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_settings WHERE key = 'whatsapp_notifications'
);

INSERT INTO public.site_settings (key, value)
SELECT 'customization_settings', '{}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_settings WHERE key = 'customization_settings'
);

-- 3. Cart and wishlist compatibility tables used by app services.
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  product_id uuid NULL,
  quantity integer NOT NULL DEFAULT 1,
  size text NULL,
  grind_type text NULL,
  client_item_id text NULL,
  name_en text NULL,
  name_ar text NULL,
  image text NULL,
  unit_price numeric(10,2) NULL,
  customizations jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS product_id uuid NULL,
  ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS size text NULL,
  ADD COLUMN IF NOT EXISTS grind_type text NULL,
  ADD COLUMN IF NOT EXISTS client_item_id text NULL,
  ADD COLUMN IF NOT EXISTS name_en text NULL,
  ADD COLUMN IF NOT EXISTS name_ar text NULL,
  ADD COLUMN IF NOT EXISTS image text NULL,
  ADD COLUMN IF NOT EXISTS unit_price numeric(10,2) NULL,
  ADD COLUMN IF NOT EXISTS customizations jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.cart_items
SET quantity = 1
WHERE quantity IS NULL;

UPDATE public.cart_items
SET customizations = '{}'::jsonb
WHERE customizations IS NULL;

UPDATE public.cart_items
SET id = gen_random_uuid()
WHERE id IS NULL;

ALTER TABLE public.cart_items
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN quantity SET DEFAULT 1,
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN customizations SET DEFAULT '{}'::jsonb,
  ALTER COLUMN customizations SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  product_id uuid NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.wishlist_items
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS product_id uuid NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE public.wishlist_items
SET id = gen_random_uuid()
WHERE id IS NULL;

ALTER TABLE public.wishlist_items
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.cart_items'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.wishlist_items'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.wishlist_items
      ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.cart_items'::regclass
        AND conname = 'cart_items_user_id_fkey'
    ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;

  IF to_regclass('public.products') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.cart_items'::regclass
        AND conname = 'cart_items_product_id_fkey'
    ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE NOT VALID;
  END IF;

  IF to_regclass('auth.users') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.wishlist_items'::regclass
        AND conname = 'wishlist_items_user_id_fkey'
    ) THEN
    ALTER TABLE public.wishlist_items
      ADD CONSTRAINT wishlist_items_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;

  IF to_regclass('public.products') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.wishlist_items'::regclass
        AND conname = 'wishlist_items_product_id_fkey'
    ) THEN
    ALTER TABLE public.wishlist_items
      ADD CONSTRAINT wishlist_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id
  ON public.cart_items (user_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
  ON public.cart_items (product_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id
  ON public.wishlist_items (user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id
  ON public.wishlist_items (product_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'cart_items'
      AND i.indisunique
      AND pg_get_indexdef(i.indexrelid) ILIKE '%(user_id, client_item_id)%'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM public.cart_items
      WHERE client_item_id IS NOT NULL
      GROUP BY user_id, client_item_id
      HAVING count(*) > 1
    ) THEN
      RAISE NOTICE 'Skipping unique index on cart_items(user_id, client_item_id): duplicate rows exist.';
    ELSE
      CREATE UNIQUE INDEX cart_items_user_client_item_unique
        ON public.cart_items (user_id, client_item_id)
        WHERE client_item_id IS NOT NULL;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'wishlist_items'
      AND i.indisunique
      AND pg_get_indexdef(i.indexrelid) ILIKE '%(user_id, product_id)%'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM public.wishlist_items
      WHERE product_id IS NOT NULL
      GROUP BY user_id, product_id
      HAVING count(*) > 1
    ) THEN
      RAISE NOTICE 'Skipping unique index on wishlist_items(user_id, product_id): duplicate rows exist.';
    ELSE
      CREATE UNIQUE INDEX wishlist_items_user_product_unique
        ON public.wishlist_items (user_id, product_id)
        WHERE product_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- 4. Product sizes uniqueness required by product seed ON CONFLICT(product_id, size).
DO $$
BEGIN
  IF to_regclass('public.product_sizes') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM pg_index i
      JOIN pg_class t ON t.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = 'product_sizes'
        AND i.indisunique
        AND pg_get_indexdef(i.indexrelid) ILIKE '%(product_id, size)%'
    ) THEN
    IF EXISTS (
      SELECT 1
      FROM public.product_sizes
      WHERE product_id IS NOT NULL
        AND size IS NOT NULL
      GROUP BY product_id, size
      HAVING count(*) > 1
    ) THEN
      RAISE NOTICE 'Skipping unique index on product_sizes(product_id, size): duplicate rows exist.';
    ELSE
      CREATE UNIQUE INDEX product_sizes_product_id_size_unique
        ON public.product_sizes (product_id, size);
    END IF;
  END IF;
END $$;

-- 5. Banner subtitles used by admin media manager.
ALTER TABLE IF EXISTS public.banners
  ADD COLUMN IF NOT EXISTS subtitle_ar text NULL,
  ADD COLUMN IF NOT EXISTS subtitle_en text NULL;

-- 6. updated_at trigger helper and table triggers.
DO $$
BEGIN
  IF to_regprocedure('public.update_updated_at()') IS NULL
    AND to_regprocedure('public.update_updated_at_column()') IS NULL THEN
    CREATE FUNCTION public.update_updated_at_column()
    RETURNS trigger AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;
END $$;

DO $$
DECLARE
  trigger_fn text;
BEGIN
  trigger_fn := CASE
    WHEN to_regprocedure('public.update_updated_at()') IS NOT NULL
      THEN 'public.update_updated_at()'
    ELSE
      'public.update_updated_at_column()'
  END;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_site_settings_updated_at'
      AND tgrelid = 'public.site_settings'::regclass
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION %s',
      trigger_fn
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_cart_items_updated_at'
      AND tgrelid = 'public.cart_items'::regclass
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION %s',
      trigger_fn
    );
  END IF;
END $$;

-- 7. Conservative RLS: no public writes.
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'Service role manage site_settings'
  ) THEN
    CREATE POLICY "Service role manage site_settings"
      ON public.site_settings
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Users read own cart_items'
  ) THEN
    CREATE POLICY "Users read own cart_items"
      ON public.cart_items
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Users insert own cart_items'
  ) THEN
    CREATE POLICY "Users insert own cart_items"
      ON public.cart_items
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Users update own cart_items'
  ) THEN
    CREATE POLICY "Users update own cart_items"
      ON public.cart_items
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Users delete own cart_items'
  ) THEN
    CREATE POLICY "Users delete own cart_items"
      ON public.cart_items
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'Service role manage cart_items'
  ) THEN
    CREATE POLICY "Service role manage cart_items"
      ON public.cart_items
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist_items'
      AND policyname = 'Users read own wishlist_items'
  ) THEN
    CREATE POLICY "Users read own wishlist_items"
      ON public.wishlist_items
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist_items'
      AND policyname = 'Users insert own wishlist_items'
  ) THEN
    CREATE POLICY "Users insert own wishlist_items"
      ON public.wishlist_items
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist_items'
      AND policyname = 'Users delete own wishlist_items'
  ) THEN
    CREATE POLICY "Users delete own wishlist_items"
      ON public.wishlist_items
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist_items'
      AND policyname = 'Service role manage wishlist_items'
  ) THEN
    CREATE POLICY "Service role manage wishlist_items"
      ON public.wishlist_items
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
