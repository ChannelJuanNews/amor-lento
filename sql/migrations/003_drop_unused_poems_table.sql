-- Drop unused poems table
-- The application now uses scheduled_content table for all poems and love letters
-- This table is no longer referenced anywhere in the codebase

-- Drop the trigger first
DROP TRIGGER IF EXISTS update_poems_updated_at ON public.poems;

-- Drop the function (only if not used elsewhere)
-- Note: If this function is used by other tables, keep it
-- DROP FUNCTION IF EXISTS public.update_poems_updated_at();

-- Drop the table
DROP TABLE IF EXISTS public.poems;

