-- Custom checkout stock deduction.
-- Allows fractional kg stock for beans/flavors and deducts checkout inventory atomically.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'coffee_beans'
      AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE public.coffee_beans
      ALTER COLUMN stock_quantity TYPE numeric(12,4)
      USING stock_quantity::numeric(12,4);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'flavor_options'
      AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE public.flavor_options
      ALTER COLUMN stock_quantity TYPE numeric(12,4)
      USING stock_quantity::numeric(12,4);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.deduct_checkout_stock(
  p_products jsonb DEFAULT '[]'::jsonb,
  p_beans jsonb DEFAULT '[]'::jsonb,
  p_flavors jsonb DEFAULT '[]'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  item_id uuid;
  product_qty integer;
  required_kg numeric;
  affected_rows integer;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(p_products, '[]'::jsonb))
  LOOP
    item_id := NULLIF(item->>'id', '')::uuid;
    product_qty := NULLIF(item->>'quantity', '')::integer;

    IF item_id IS NULL OR product_qty IS NULL OR product_qty <= 0 THEN
      RAISE EXCEPTION 'INVALID_PRODUCT_STOCK_PAYLOAD';
    END IF;

    UPDATE public.products
    SET stock_quantity = stock_quantity - product_qty,
        updated_at = now()
    WHERE id = item_id
      AND stock_quantity IS NOT NULL
      AND stock_quantity >= product_qty
      AND COALESCE(is_manually_out_of_stock, false) = false;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows <> 1 THEN
      RAISE EXCEPTION 'INSUFFICIENT_PRODUCT_STOCK:%', item_id;
    END IF;
  END LOOP;

  FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(p_beans, '[]'::jsonb))
  LOOP
    item_id := NULLIF(item->>'id', '')::uuid;
    required_kg := round(NULLIF(item->>'required_kg', '')::numeric, 4);

    IF item_id IS NULL OR required_kg IS NULL OR required_kg <= 0 THEN
      RAISE EXCEPTION 'INVALID_BEAN_STOCK_PAYLOAD';
    END IF;

    UPDATE public.coffee_beans
    SET stock_quantity = round((stock_quantity - required_kg)::numeric, 4),
        updated_at = now()
    WHERE id = item_id
      AND stock_quantity IS NOT NULL
      AND stock_quantity >= required_kg
      AND COALESCE(is_active, true) = true
      AND COALESCE(is_manually_out_of_stock, false) = false;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows <> 1 THEN
      RAISE EXCEPTION 'INSUFFICIENT_BEAN_STOCK:%', item_id;
    END IF;
  END LOOP;

  FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(p_flavors, '[]'::jsonb))
  LOOP
    item_id := NULLIF(item->>'id', '')::uuid;
    required_kg := round(NULLIF(item->>'required_kg', '')::numeric, 4);

    IF item_id IS NULL OR required_kg IS NULL OR required_kg <= 0 THEN
      RAISE EXCEPTION 'INVALID_FLAVOR_STOCK_PAYLOAD';
    END IF;

    UPDATE public.flavor_options
    SET stock_quantity = round((stock_quantity - required_kg)::numeric, 4),
        updated_at = now()
    WHERE id = item_id
      AND stock_quantity IS NOT NULL
      AND stock_quantity >= required_kg
      AND COALESCE(is_active, true) = true
      AND COALESCE(is_manually_out_of_stock, false) = false;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows <> 1 THEN
      RAISE EXCEPTION 'INSUFFICIENT_FLAVOR_STOCK:%', item_id;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.deduct_checkout_stock(jsonb, jsonb, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.deduct_checkout_stock(jsonb, jsonb, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.deduct_checkout_stock(jsonb, jsonb, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_checkout_stock(jsonb, jsonb, jsonb) TO service_role;
