import { Router, Request, Response } from 'express'
import { verifyAuth, requireAdmin } from './middleware/auth'
import supabase from '@/lib/supabase'
import supabaseAdmin from '@/lib/supabase-admin'

const adminRouter = Router()

// All admin routes require authentication and admin role
adminRouter.use(verifyAuth)
adminRouter.use(requireAdmin)

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
adminRouter.get('/stats', async (req: Request, res: Response) => {
    try {
        // Use admin client to bypass RLS policies
        const client = supabaseAdmin || supabase

        // Get scheduled content counts
        const { count: scheduledCount } = await client
            .from('scheduled_content')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'scheduled')

        const { count: totalCount } = await client
            .from('scheduled_content')
            .select('*', { count: 'exact', head: true })

        const stats = {
            scheduledCount: scheduledCount || 0,
            totalCount: totalCount || 0,
        }

        res.json(stats)
    } catch (error: any) {
        console.error('[Admin API] Error getting stats:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * Transform database row to ScheduledContent format
 */
function transformContentRow(row: any): any {
    return {
        id: row.id,
        type: row.type,
        status: row.status,
        title: row.title,
        content: row.content,
        excerpt: row.excerpt,
        lang: row.lang,
        tags: row.tags || [],
        scheduledAt: row.scheduled_at || undefined,
        publishedAt: row.published_at || undefined,
        recurrence: row.recurrence || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        authorNotes: row.author_notes || undefined,
        audioSrc: row.audio_src || undefined,
    }
}

/**
 * Transform ScheduledContent to database format
 */
function transformContentToDb(content: any): any {
    // scheduled_at should be date-only (YYYY-MM-DD)
    // Note: Database may still be TIMESTAMPTZ until migration is run, but we'll send date-only format
    let scheduledAt: string | null = null
    if (content.scheduledAt || content.scheduled_at) {
        const dateStr = content.scheduledAt || content.scheduled_at
        if (dateStr && dateStr.trim() !== '') {
            // If it's already a date string (YYYY-MM-DD), use it directly
            // If it's a full datetime, extract just the date part
            if (dateStr.includes('T')) {
                scheduledAt = dateStr.split('T')[0]
            } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Valid date format
                scheduledAt = dateStr
            } else {
                // Try to parse and extract date
                try {
                    const date = new Date(dateStr)
                    if (!isNaN(date.getTime())) {
                        scheduledAt = date.toISOString().split('T')[0]
                    }
                } catch (e) {
                    console.warn('[Admin API] Invalid scheduled_at format:', dateStr)
                }
            }
        }
    }

    // published_at should be TIMESTAMPTZ (full ISO string with timezone)
    let publishedAt: string | null = null
    if (content.publishedAt || content.published_at) {
        const publishedAtValue = content.publishedAt || content.published_at
        if (publishedAtValue) {
            // Ensure it's a valid ISO string
            if (!publishedAtValue.includes('Z') && !publishedAtValue.includes('+') && !publishedAtValue.includes('-', 10)) {
                // If no timezone info, assume UTC
                publishedAt = new Date(publishedAtValue).toISOString()
            } else {
                publishedAt = publishedAtValue
            }
        }
    }

    return {
        type: content.type,
        status: content.status,
        title: content.title,
        content: content.content,
        excerpt: content.excerpt,
        lang: content.lang,
        tags: content.tags || [],
        scheduled_at: scheduledAt,
        published_at: publishedAt,
        recurrence: content.recurrence || null,
        author_notes: content.authorNotes || content.author_notes || null,
        audio_src: content.audioSrc || content.audio_src || null,
    }
}

/**
 * GET /api/admin/content
 * Get all scheduled content (admin only)
 */
adminRouter.get('/content', async (req: Request, res: Response) => {
    try {
        // Use admin client to bypass RLS policies
        const client = supabaseAdmin || supabase
        
        const { data, error } = await client
            .from('scheduled_content')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        const transformed = (data || []).map(transformContentRow)
        res.json({ content: transformed })
    } catch (error: any) {
        console.error('[Admin API] Error getting content:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/admin/content
 * Create new scheduled content (admin only)
 */
adminRouter.post('/content', async (req: Request, res: Response) => {
    try {
        // Use admin client to bypass RLS policies
        const client = supabaseAdmin || supabase
        
        const dbContent = transformContentToDb(req.body)
        
        // Log for debugging
        console.log('[Admin API] Creating content with data:', JSON.stringify(dbContent, null, 2))

        const { data, error } = await client
            .from('scheduled_content')
            .insert(dbContent)
            .select()
            .single()

        if (error) {
            console.error('[Admin API] Supabase error creating content:', error)
            return res.status(500).json({ error: error.message, details: error })
        }

        res.json({ content: transformContentRow(data) })
    } catch (error: any) {
        console.error('[Admin API] Error creating content:', error)
        res.status(500).json({ error: error.message || 'Internal server error', details: error })
    }
})

/**
 * PUT /api/admin/content/:id
 * Update scheduled content (admin only)
 */
adminRouter.put('/content/:id', async (req: Request, res: Response) => {
    try {
        // Use admin client to bypass RLS policies
        const client = supabaseAdmin || supabase
        
        const { id } = req.params
        const dbUpdates = transformContentToDb(req.body)

        const { data, error } = await client
            .from('scheduled_content')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        res.json({ content: transformContentRow(data) })
    } catch (error: any) {
        console.error('[Admin API] Error updating content:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * DELETE /api/admin/content/:id
 * Delete scheduled content (admin only)
 */
adminRouter.delete('/content/:id', async (req: Request, res: Response) => {
    try {
        // Use admin client to bypass RLS policies
        const client = supabaseAdmin || supabase
        
        const { id } = req.params

        const { error } = await client
            .from('scheduled_content')
            .delete()
            .eq('id', id)

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        res.json({ success: true })
    } catch (error: any) {
        console.error('[Admin API] Error deleting content:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/admin/webhooks
 * Get Resend webhook events (admin only)
 * Query params: limit, offset, event_type, email_id
 */
adminRouter.get('/webhooks', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50
        const offset = parseInt(req.query.offset as string) || 0
        const eventType = req.query.event_type as string | undefined
        const emailId = req.query.email_id as string | undefined

        // Use admin client to bypass RLS policies
        const client = supabaseAdmin || supabase
        
        let query = client
            .from('resend_webhooks')
            .select('*')
            .order('received_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (eventType) {
            query = query.eq('event_type', eventType)
        }

        if (emailId) {
            query = query.eq('email_id', emailId)
        }

        const { data, error } = await query

        if (error) {
            console.error('[Admin API] Error querying webhooks:', error)
            return res.status(500).json({ error: error.message })
        }

        // Get total count for pagination
        let countQuery = client
            .from('resend_webhooks')
            .select('*', { count: 'exact', head: true })

        if (eventType) {
            countQuery = countQuery.eq('event_type', eventType)
        }

        if (emailId) {
            countQuery = countQuery.eq('email_id', emailId)
        }

        const { count, error: countError } = await countQuery
        
        if (countError) {
            console.error('[Admin API] Error counting webhooks:', countError)
        }

        res.json({
            webhooks: data || [],
            total: count || 0,
            limit,
            offset,
        })
    } catch (error: any) {
        console.error('[Admin API] Error getting webhooks:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default adminRouter

