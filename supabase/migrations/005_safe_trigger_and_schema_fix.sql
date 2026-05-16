-- ============================================================
-- LINE COFFEE — Safe trigger + complete schema verification
-- Run this in Supabase SQL Editor if signups are failing with
-- "Database error saving new user"
-- ============================================================

-- 1. Ensure ALL profile columns exist (safe to re-run)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp       text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_link  text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address        text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city           text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes          text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url     text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'ar';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone          text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name     text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name      text;

-- 2. Rewrite handle_new_user() with an EXCEPTION block.
--    This is the critical fix: the trigger MUST NEVER raise an unhandled
--    exception or it will roll back the entire auth user creation and block signup.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
      first_name         = COALESCE(EXCLUDED.first_name,         profiles.first_name),
      last_name          = COALESCE(EXCLUDED.last_name,          profiles.last_name),
      phone              = COALESCE(EXCLUDED.phone,              profiles.phone),
      whatsapp           = COALESCE(EXCLUDED.whatsapp,           profiles.whatsapp),
      address            = COALESCE(EXCLUDED.address,            profiles.address),
      location_link      = COALESCE(EXCLUDED.location_link,      profiles.location_link),
      preferred_language = COALESCE(EXCLUDED.preferred_language, profiles.preferred_language),
      updated_at         = now();
  EXCEPTION WHEN OTHERS THEN
    -- Log the error to Postgres logs but NEVER block user creation.
    -- The server action will upsert the profile as a second attempt.
    RAISE WARNING 'handle_new_user: profile insert failed for user %, sqlstate=%, error=%',
      NEW.id, SQLSTATE, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Ensure complete RLS policy set on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role manage profiles" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role manage profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Diagnostics — run the SELECT below to verify the trigger exists:
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_auth_user_created';

-- 6. Diagnostics — run this to see any orphaned auth users without profiles:
-- SELECT au.id, au.email, au.created_at, p.id AS profile_id
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON p.id = au.id
-- WHERE p.id IS NULL;

NOTIFY pgrst, 'reload schema';
