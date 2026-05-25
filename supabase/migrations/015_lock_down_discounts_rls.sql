-- Lock down discount codes so public clients cannot list active discounts.
-- Discount validation now happens through server API routes only.

DO $$
BEGIN
  IF to_regclass('public.discounts') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Public read active discounts" ON public.discounts;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'discounts'
      AND policyname = 'Service role manage discounts'
  ) THEN
    CREATE POLICY "Service role manage discounts"
      ON public.discounts
      FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
