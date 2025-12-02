-- Create text_messages table for iPhone-style text message mockups
CREATE TABLE IF NOT EXISTS public.text_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),

  -- Content
  title TEXT NOT NULL, -- Title for admin/listing purposes

  -- Contact info
  contact_name TEXT NOT NULL,
  contact_image TEXT, -- URL to contact avatar image

  -- Messages array: [{ sender: 'user' | 'contact', text: string, timestamp: string }]
  messages JSONB NOT NULL DEFAULT '[]',

  -- Draft message (shown in keyboard, not yet sent)
  draft_message TEXT,

  -- Metadata
  lang TEXT NOT NULL CHECK (lang IN ('en', 'es')),
  tags TEXT[] DEFAULT '{}',

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_notes TEXT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_text_messages_status ON public.text_messages(status);
CREATE INDEX IF NOT EXISTS idx_text_messages_lang ON public.text_messages(lang);
CREATE INDEX IF NOT EXISTS idx_text_messages_published_at ON public.text_messages(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_text_messages_scheduled_at ON public.text_messages(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_text_messages_tags ON public.text_messages USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.text_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published or scheduled content
CREATE POLICY "Anyone can view published or scheduled text messages"
  ON public.text_messages
  FOR SELECT
  USING (status IN ('published', 'scheduled'));

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage text messages"
  ON public.text_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_text_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_text_messages_updated_at ON public.text_messages;
CREATE TRIGGER update_text_messages_updated_at
  BEFORE UPDATE ON public.text_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_text_messages_updated_at();

-- Grant permissions
GRANT SELECT ON public.text_messages TO anon;
GRANT SELECT ON public.text_messages TO authenticated;
GRANT ALL ON public.text_messages TO service_role;
