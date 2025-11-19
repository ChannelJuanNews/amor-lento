-- Create scheduled_content table for daily poems and weekly love letters
CREATE TABLE IF NOT EXISTS public.scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('daily-poem', 'weekly-love-letter')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'es')),
  tags TEXT[] DEFAULT '{}',
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  recurrence JSONB, -- { type: 'once'|'daily'|'weekly'|'monthly', dayOfWeek?: number, dayOfMonth?: number, endDate?: string }
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_notes TEXT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_scheduled_content_type ON public.scheduled_content(type);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_status ON public.scheduled_content(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_lang ON public.scheduled_content(lang);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_published_at ON public.scheduled_content(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_scheduled_at ON public.scheduled_content(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_tags ON public.scheduled_content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_type_status ON public.scheduled_content(type, status);

-- Enable Row Level Security
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published or scheduled content
CREATE POLICY "Anyone can view published or scheduled content"
  ON public.scheduled_content
  FOR SELECT
  USING (status IN ('published', 'scheduled'));

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage scheduled content"
  ON public.scheduled_content
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_scheduled_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_scheduled_content_updated_at ON public.scheduled_content;
CREATE TRIGGER update_scheduled_content_updated_at
  BEFORE UPDATE ON public.scheduled_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scheduled_content_updated_at();

-- Grant permissions
GRANT SELECT ON public.scheduled_content TO anon;
GRANT SELECT ON public.scheduled_content TO authenticated;
GRANT ALL ON public.scheduled_content TO service_role;

