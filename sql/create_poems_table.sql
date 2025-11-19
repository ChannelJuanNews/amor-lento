-- Create poems table
CREATE TABLE IF NOT EXISTS public.poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'es')),
  tags TEXT[] DEFAULT '{}',
  length TEXT CHECK (length IN ('short', 'long')),
  audio_src TEXT,
  published_at TIMESTAMPTZ,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_poems_published ON public.poems(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_poems_lang ON public.poems(lang);
CREATE INDEX IF NOT EXISTS idx_poems_tags ON public.poems USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_poems_slug ON public.poems(slug);

-- Enable Row Level Security
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published poems
CREATE POLICY "Anyone can view published poems"
  ON public.poems
  FOR SELECT
  USING (published = true);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage poems"
  ON public.poems
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_poems_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_poems_updated_at ON public.poems;
CREATE TRIGGER update_poems_updated_at
  BEFORE UPDATE ON public.poems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poems_updated_at();

-- Grant permissions
GRANT SELECT ON public.poems TO anon;
GRANT SELECT ON public.poems TO authenticated;
GRANT ALL ON public.poems TO service_role;

