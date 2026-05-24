-- 013_custom_options_stock.sql
-- Adds availability controls for custom espresso blend beans and Make Your Flavor options.
-- Safe defaults keep existing active rows available after the migration.

ALTER TABLE public.coffee_beans
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS is_manually_out_of_stock boolean NOT NULL DEFAULT false;

ALTER TABLE public.flavor_options
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS is_manually_out_of_stock boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'coffee_beans_stock_quantity_nonnegative'
      AND conrelid = 'public.coffee_beans'::regclass
  ) THEN
    ALTER TABLE public.coffee_beans
      ADD CONSTRAINT coffee_beans_stock_quantity_nonnegative
      CHECK (stock_quantity >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'coffee_beans_low_stock_threshold_nonnegative'
      AND conrelid = 'public.coffee_beans'::regclass
  ) THEN
    ALTER TABLE public.coffee_beans
      ADD CONSTRAINT coffee_beans_low_stock_threshold_nonnegative
      CHECK (low_stock_threshold >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'flavor_options_stock_quantity_nonnegative'
      AND conrelid = 'public.flavor_options'::regclass
  ) THEN
    ALTER TABLE public.flavor_options
      ADD CONSTRAINT flavor_options_stock_quantity_nonnegative
      CHECK (stock_quantity >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'flavor_options_low_stock_threshold_nonnegative'
      AND conrelid = 'public.flavor_options'::regclass
  ) THEN
    ALTER TABLE public.flavor_options
      ADD CONSTRAINT flavor_options_low_stock_threshold_nonnegative
      CHECK (low_stock_threshold >= 0);
  END IF;
END $$;

UPDATE public.coffee_beans
SET
  stock_quantity = COALESCE(stock_quantity, 100),
  low_stock_threshold = COALESCE(low_stock_threshold, 10),
  is_manually_out_of_stock = COALESCE(is_manually_out_of_stock, false);

UPDATE public.flavor_options
SET
  stock_quantity = COALESCE(stock_quantity, 100),
  low_stock_threshold = COALESCE(low_stock_threshold, 10),
  is_manually_out_of_stock = COALESCE(is_manually_out_of_stock, false);

SELECT 'custom option stock controls ready' AS status;
