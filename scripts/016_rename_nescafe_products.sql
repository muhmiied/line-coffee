-- ============================================================
-- Line Coffee: Rename Nescafe product names (EN only)
-- ============================================================
-- Renames:
--   Classic Nescafe  →  Nescafe Classic
--   Gold Nescafe     →  Nescafe Gold
-- Arabic names are unchanged. Prices unchanged. Slugs unchanged.
-- ============================================================

BEGIN;

UPDATE public.products
SET
  name_en              = 'Nescafe Classic',
  short_description_en = 'Nescafe Classic instant coffee.'
WHERE slug = 'classic-nescafe';

UPDATE public.products
SET
  name_en              = 'Nescafe Gold',
  short_description_en = 'Nescafe Gold instant coffee.'
WHERE slug = 'gold-nescafe';

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verification: confirm new names and unchanged prices.
SELECT
  p.slug,
  p.name_en,
  p.name_ar,
  ps.size,
  ps.price
FROM public.products p
JOIN public.product_sizes ps ON ps.product_id = p.id
WHERE p.slug IN ('classic-nescafe', 'gold-nescafe')
ORDER BY p.slug, ps.size;
