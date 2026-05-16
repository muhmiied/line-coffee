-- Fix signup robustness:
-- 1. Add whatsapp column to profiles (collected in signup form but had no column)
-- 2. Add INSERT RLS policy for authenticated users
-- 3. Fix trigger to copy all signup fields (phone, whatsapp, address, location_link)

-- Add whatsapp column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp text;

-- Allow authenticated users to insert their own profile (fallback if trigger fails)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fix trigger to copy all fields sent during signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id,
    first_name,
    last_name,
    phone,
    whatsapp,
    address,
    location_link,
    preferred_language
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'location_link',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ar')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name         = EXCLUDED.first_name,
    last_name          = EXCLUDED.last_name,
    phone              = COALESCE(EXCLUDED.phone, profiles.phone),
    whatsapp           = COALESCE(EXCLUDED.whatsapp, profiles.whatsapp),
    address            = COALESCE(EXCLUDED.address, profiles.address),
    location_link      = COALESCE(EXCLUDED.location_link, profiles.location_link),
    preferred_language = COALESCE(EXCLUDED.preferred_language, profiles.preferred_language),
    updated_at         = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

NOTIFY pgrst, 'reload schema';
