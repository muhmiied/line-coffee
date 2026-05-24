-- =============================================
-- MIGRATION 023: Testimonials Approval System
-- =============================================
-- Adds is_approved for admin moderation workflow.
-- Makes content_ar nullable for public submissions.
-- Approves all existing manually-added testimonials.
-- =============================================

-- 1. Add is_approved column (pending moderation by default)
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 2. Add updated_at for tracking admin modifications
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Make content_ar nullable — public submissions may be in one language only
ALTER TABLE public.testimonials
  ALTER COLUMN content_ar DROP NOT NULL;

-- 4. All existing admin-seeded testimonials are pre-approved
UPDATE public.testimonials
SET is_approved = true
WHERE is_visible = true AND is_approved IS DISTINCT FROM true;

-- 5. Index for fast pending-queue lookup
CREATE INDEX IF NOT EXISTS idx_testimonials_pending
  ON public.testimonials(is_approved)
  WHERE is_approved = false;

-- 6. Index for public-facing approved+visible query
CREATE INDEX IF NOT EXISTS idx_testimonials_public
  ON public.testimonials(is_approved, is_visible)
  WHERE is_approved = true AND is_visible = true;
