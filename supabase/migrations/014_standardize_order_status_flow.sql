-- Standardize order status flow.
-- Keeps existing orders, converts legacy "processing" to "preparing",
-- and replaces the old status CHECK constraint with the current flow.

DO $$
DECLARE
  constraint_record record;
BEGIN
  IF to_regclass('public.orders') IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.orders
  SET status = 'preparing'
  WHERE status = 'processing';

  FOR constraint_record IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'public.orders'::regclass
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%status%'
      AND pg_get_constraintdef(c.oid) ILIKE '%pending%'
      AND pg_get_constraintdef(c.oid) ILIKE '%cancelled%'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND conname = 'orders_status_standard_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_standard_check
      CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'));
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

