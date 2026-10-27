-- Run once in Supabase (SQL Editor) after creating the tables.
-- The browser never talks to Supabase directly, so no anon/authenticated access is needed.
-- Enabling RLS with no policies blocks the public Data API; the backend services connect
-- with the database role and are not affected.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;
