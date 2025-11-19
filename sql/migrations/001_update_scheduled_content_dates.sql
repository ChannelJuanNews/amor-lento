-- Migration: Update scheduled_at to DATE and ensure published_at supports timezone
-- scheduled_at should be date-only (no time component)
-- published_at should remain TIMESTAMPTZ (already supports timezone)

-- Convert scheduled_at from TIMESTAMPTZ to DATE
-- First, update existing data to extract just the date portion
UPDATE public.scheduled_content 
SET scheduled_at = scheduled_at::date::timestamp 
WHERE scheduled_at IS NOT NULL;

-- Alter the column type from TIMESTAMPTZ to DATE
ALTER TABLE public.scheduled_content 
ALTER COLUMN scheduled_at TYPE DATE USING scheduled_at::date;

-- Add a comment to clarify the column purpose
COMMENT ON COLUMN public.scheduled_content.scheduled_at IS 'Date only (no time) - when content should be scheduled';
COMMENT ON COLUMN public.scheduled_content.published_at IS 'Timestamp with timezone - when content was/will be published';

