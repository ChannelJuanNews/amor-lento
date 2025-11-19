import { Router, Request, Response } from 'express'
import { randomUUID } from 'crypto'
import supabase from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/emails'

const subscriptionsRouter = Router()

/**
 * POST /api/subscriptions/subscribe
 * Subscribe an email to the newsletter
 */
subscriptionsRouter.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, locale } = req.body

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Validate locale if provided
    const validLocale = locale === 'es' ? 'es' : 'en'

    // Check if email already exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id, subscribed, unsubscribe_token')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      if (existing.subscribed) {
        // Already subscribed
        return res.json({
          success: true,
          message: 'Email is already subscribed',
          alreadySubscribed: true,
        })
      } else {
        // Resubscribe - generate new token
        const newToken = randomUUID()
        
        const { data: updated, error } = await supabase
          .from('subscriptions')
          .update({
            subscribed: true,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
            unsubscribe_token: newToken,
          })
          .eq('id', existing.id)
          .select('unsubscribe_token')
          .single()

        if (error) {
          console.error('[Subscriptions API] Error resubscribing:', error)
          return res.status(500).json({ error: 'Failed to resubscribe' })
        }

        // Send welcome email (don't block response if email fails)
        sendWelcomeEmail({
          email: email.toLowerCase().trim(),
          locale: validLocale,
          unsubscribeToken: updated?.unsubscribe_token || newToken,
        }).catch((err) => {
          console.error('[Subscriptions API] Failed to send welcome email:', err)
        })

        return res.json({
          success: true,
          message: 'Successfully resubscribed',
          alreadySubscribed: false,
        })
      }
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        email: email.toLowerCase().trim(),
        subscribed: true,
      })
      .select('unsubscribe_token')
      .single()

    if (error) {
      console.error('[Subscriptions API] Error subscribing:', error)
      return res.status(500).json({ error: 'Failed to subscribe' })
    }

    // Send welcome email (don't block response if email fails)
    sendWelcomeEmail({
      email: email.toLowerCase().trim(),
      locale: validLocale,
      unsubscribeToken: data?.unsubscribe_token,
    }).catch((err) => {
      console.error('[Subscriptions API] Failed to send welcome email:', err)
    })

    res.json({
      success: true,
      message: 'Successfully subscribed',
      alreadySubscribed: false,
    })
  } catch (error: any) {
    console.error('[Subscriptions API] Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/subscriptions/unsubscribe
 * Unsubscribe an email from the newsletter
 * Can use either email or unsubscribe_token
 */
subscriptionsRouter.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body

    if (!email && !token) {
      return res.status(400).json({ error: 'Email or unsubscribe token is required' })
    }

    let query = supabase
      .from('subscriptions')
      .select('id, subscribed')

    if (token) {
      query = query.eq('unsubscribe_token', token)
    } else if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' })
      }
      query = query.eq('email', email.toLowerCase().trim())
    }

    const { data: subscription, error: fetchError } = await query.single()

    if (fetchError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    if (!subscription.subscribed) {
      return res.json({
        success: true,
        message: 'Email is already unsubscribed',
        alreadyUnsubscribed: true,
      })
    }

    // Unsubscribe
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        subscribed: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('[Subscriptions API] Error unsubscribing:', updateError)
      return res.status(500).json({ error: 'Failed to unsubscribe' })
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed',
      alreadyUnsubscribed: false,
    })
  } catch (error: any) {
    console.error('[Subscriptions API] Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/subscriptions/status
 * Check subscription status (for unsubscribe pages)
 * Query params: email or token
 */
subscriptionsRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const { email, token } = req.query

    if (!email && !token) {
      return res.status(400).json({ error: 'Email or unsubscribe token is required' })
    }

    let query = supabase
      .from('subscriptions')
      .select('email, subscribed, subscribed_at, unsubscribed_at')

    if (token) {
      query = query.eq('unsubscribe_token', token as string)
    } else if (email) {
      query = query.eq('email', (email as string).toLowerCase().trim())
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    res.json({
      email: data.email,
      subscribed: data.subscribed,
      subscribedAt: data.subscribed_at,
      unsubscribedAt: data.unsubscribed_at,
    })
  } catch (error: any) {
    console.error('[Subscriptions API] Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default subscriptionsRouter

