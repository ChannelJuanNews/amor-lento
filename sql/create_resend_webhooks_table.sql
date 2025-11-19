-- Create resend_webhooks table for storing Resend webhook events
CREATE TABLE IF NOT EXISTS public.resend_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Webhook event data
  event_type TEXT NOT NULL, -- email.sent, email.delivered, email.bounced, email.complained, email.opened, email.clicked
  email_id TEXT, -- Resend email ID
  to_email TEXT, -- Recipient email
  from_email TEXT, -- Sender email
  subject TEXT, -- Email subject
  
  -- Event-specific data stored as JSONB for flexibility
  event_data JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_resend_webhooks_event_type ON public.resend_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_resend_webhooks_email_id ON public.resend_webhooks(email_id);
CREATE INDEX IF NOT EXISTS idx_resend_webhooks_to_email ON public.resend_webhooks(to_email);
CREATE INDEX IF NOT EXISTS idx_resend_webhooks_received_at ON public.resend_webhooks(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_resend_webhooks_event_type_received_at ON public.resend_webhooks(event_type, received_at DESC);

-- Enable Row Level Security
ALTER TABLE public.resend_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for webhook endpoint and admin operations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'resend_webhooks'
      AND policyname = 'Service role can manage resend webhooks'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Service role can manage resend webhooks"
        ON public.resend_webhooks
        FOR ALL
        USING (true)
        WITH CHECK (true);
    $policy$;
  END IF;
END
$$;

-- Policy: Authenticated users (admins) can read webhooks
-- This allows admin routes to read webhook events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'resend_webhooks'
      AND policyname = 'Authenticated users can read webhooks'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can read webhooks"
        ON public.resend_webhooks
        FOR SELECT
        USING (auth.role() = 'authenticated');
    $policy$;
  END IF;
END
$$;

-- Grant permissions
GRANT INSERT ON public.resend_webhooks TO anon; -- Webhook endpoint needs to insert
GRANT SELECT ON public.resend_webhooks TO authenticated; -- Admins can view
GRANT ALL ON public.resend_webhooks TO service_role;

