-- Line Coffee Database Schema: Testimonials
-- Can be run independently

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text_en TEXT NOT NULL,
  text_ar TEXT,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved testimonials
CREATE POLICY "Anyone can view approved testimonials" ON testimonials
  FOR SELECT USING (is_approved = true);

-- Index
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved) WHERE is_approved = true;
