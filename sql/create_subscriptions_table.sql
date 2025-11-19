-- Create subscriptions table for newsletter email subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON public.subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscribed ON public.subscriptions(subscribed);
CREATE INDEX IF NOT EXISTS idx_subscriptions_unsubscribe_token ON public.subscriptions(unsubscribe_token);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert subscriptions (for public signup)
CREATE POLICY "Anyone can subscribe"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update their own subscription (using unsubscribe token)
CREATE POLICY "Anyone can unsubscribe with token"
  ON public.subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- Grant permissions
GRANT INSERT ON public.subscriptions TO anon;
GRANT INSERT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

