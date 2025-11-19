-- Create the version function for health checks
-- This function is called via Supabase RPC: supabase.rpc('version')
-- It returns the PostgreSQL version string, which is useful for health checks

CREATE OR REPLACE FUNCTION public.version()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT pg_catalog.version();
$$;

-- Grant execute permission to authenticated users (adjust as needed for your security requirements)
GRANT EXECUTE ON FUNCTION public.version() TO authenticated;
GRANT EXECUTE ON FUNCTION public.version() TO anon;

