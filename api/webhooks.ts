import { Router, Request, Response } from 'express'
import supabase from '@/lib/supabase'
import crypto from 'crypto'

const webhooksRouter = Router()

/**
 * POST /api/webhooks/resend
 * Receive webhook events from Resend
 * Resend sends webhook events with signature verification
 */
webhooksRouter.post('/resend', async (req: Request, res: Response) => {
  try {
    // Verify webhook signature (optional but recommended)
    const signature = req.headers['resend-signature'] as string
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      // Resend uses HMAC SHA256 for signature verification
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('[Webhooks] Invalid webhook signature')
        return res.status(401).json({ error: 'Invalid signature' })
      }
    }

    const { type, data } = req.body

    if (!type) {
      return res.status(400).json({ error: 'Missing event type' })
    }

    // Extract relevant data from Resend webhook payload
    const emailId = data?.email_id || data?.id || null
    const toEmail = data?.to || (Array.isArray(data?.to) ? data.to[0] : null) || null
    const fromEmail = data?.from || null
    const subject = data?.subject || null

    // Store webhook event in database
    const { error } = await supabase
      .from('resend_webhooks')
      .insert({
        event_type: type,
        email_id: emailId,
        to_email: toEmail,
        from_email: fromEmail,
        subject: subject,
        event_data: data || {},
      })

    if (error) {
      console.error('[Webhooks] Error storing webhook event:', error)
      return res.status(500).json({ error: 'Failed to store webhook event' })
    }

    console.log(`[Webhooks] Stored Resend webhook event: ${type} for email ${emailId || toEmail}`)

    // Return 200 OK to acknowledge receipt
    res.status(200).json({ success: true, message: 'Webhook received' })
  } catch (error: any) {
    console.error('[Webhooks] Error processing webhook:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default webhooksRouter

