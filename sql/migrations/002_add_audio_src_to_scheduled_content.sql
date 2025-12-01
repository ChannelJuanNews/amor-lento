-- Add audio_src column to scheduled_content table
-- This will store the path/URL to the audio file for poems

ALTER TABLE public.scheduled_content 
ADD COLUMN IF NOT EXISTS audio_src TEXT;

-- Add index for faster queries when filtering by audio availability
CREATE INDEX IF NOT EXISTS idx_scheduled_content_audio_src 
ON public.scheduled_content(audio_src) 
WHERE audio_src IS NOT NULL;

