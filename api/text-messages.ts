import { Router, Request, Response } from 'express'
import supabase from '@/lib/supabase'

const textMessagesRouter = Router()

/**
 * Transform database row to TextMessage format
 */
function transformTextMessageRow(row: any): any {
    return {
        id: row.id,
        status: row.status,
        title: row.title,
        contactName: row.contact_name,
        contactImage: row.contact_image || undefined,
        messages: row.messages || [],
        draftMessage: row.draft_message || undefined,
        lang: row.lang,
        tags: row.tags || [],
        scheduledAt: row.scheduled_at || undefined,
        publishedAt: row.published_at || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        authorNotes: row.author_notes || undefined,
    }
}

/**
 * Helper function to create slug from title (matches frontend logic)
 */
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

/**
 * Validate message character limit (150 characters)
 */
function validateMessages(messages: any[]): { valid: boolean; error?: string } {
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        if (!msg.sender || !msg.text || !msg.timestamp) {
            return { valid: false, error: `Message at index ${i} is missing required fields` }
        }
        if (msg.sender !== 'user' && msg.sender !== 'contact') {
            return { valid: false, error: `Message at index ${i} has invalid sender: ${msg.sender}` }
        }
        if (msg.text.length > 150) {
            return { valid: false, error: `Message at index ${i} exceeds 150 character limit (${msg.text.length} characters)` }
        }
    }
    return { valid: true }
}

/**
 * GET /api/text-messages
 * Get paginated text messages (public)
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 *   - lang: filter by language ('en' | 'es')
 *   - tag: filter by tag
 */
textMessagesRouter.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const lang = req.query.lang as string | undefined
        const tag = req.query.tag as string | undefined

        const offset = (page - 1) * limit
        const now = new Date().toISOString()

        // Build query - get text messages
        // Only show messages that are actually published (published_at <= now) or scheduled (scheduled_at <= now)
        let query = supabase
            .from('text_messages')
            .select('*', { count: 'exact' })
            .in('status', ['published', 'scheduled'])
            // Filter: published_at <= now OR scheduled_at <= now
            // This ensures we only show messages that should be visible (not future-dated)
            .or(`published_at.lte.${now},scheduled_at.lte.${now}`)
            // Order by published_at first (descending), then scheduled_at (descending)
            // nullsFirst: false means NULL values come last
            .order('published_at', { ascending: false, nullsFirst: false })
            .order('scheduled_at', { ascending: false, nullsFirst: false })

        // Apply filters
        if (lang && (lang === 'en' || lang === 'es')) {
            query = query.eq('lang', lang)
        }

        if (tag) {
            query = query.contains('tags', [tag])
        }

        // Get total count and paginated results
        const { data, error, count } = await query.range(offset, offset + limit - 1)

        if (error) {
            console.error('[Text Messages API] Error:', error)
            return res.status(500).json({ error: error.message })
        }

        // Transform the data to match frontend expectations
        const transformed = (data || []).map(transformTextMessageRow)

        res.json({
            textMessages: transformed,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasMore: offset + limit < (count || 0),
            },
        })
    } catch (error: any) {
        console.error('[Text Messages API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/text-messages/:slug
 * Get a single text message by slug (public)
 */
textMessagesRouter.get('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params
        const now = new Date().toISOString()

        // Get all published text messages that should be visible
        const { data, error } = await supabase
            .from('text_messages')
            .select('*')
            .in('status', ['published', 'scheduled'])
            .or(`published_at.lte.${now},scheduled_at.lte.${now}`)

        if (error) {
            console.error('[Text Messages API] Error fetching text messages:', error)
            return res.status(500).json({ error: error.message })
        }

        // Find the message that matches the slug
        const textMessage = (data || []).find((msg) => {
            const msgSlug = createSlug(msg.title)
            return msgSlug === slug
        })

        if (!textMessage) {
            return res.status(404).json({ error: 'Text message not found' })
        }

        // Transform the data to match frontend expectations
        const transformed = transformTextMessageRow(textMessage)

        res.json({ textMessage: transformed })
    } catch (error: any) {
        console.error('[Text Messages API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/text-messages (Admin only)
 * Create a new text message
 */
textMessagesRouter.post('/', async (req: Request, res: Response) => {
    try {
        const {
            title,
            contactName,
            contactImage,
            messages,
            draftMessage,
            lang,
            tags,
            status,
            scheduledAt,
            publishedAt,
            authorNotes,
        } = req.body

        // Validation
        if (!title || !contactName || !messages || !lang) {
            return res.status(400).json({
                error: 'Missing required fields: title, contactName, messages, lang',
            })
        }

        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages must be an array' })
        }

        // Validate messages
        const validation = validateMessages(messages)
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error })
        }

        // Validate draft message
        if (draftMessage && draftMessage.length > 150) {
            return res.status(400).json({
                error: `Draft message exceeds 150 character limit (${draftMessage.length} characters)`,
            })
        }

        // Insert into database
        const { data, error } = await supabase
            .from('text_messages')
            .insert({
                title,
                contact_name: contactName,
                contact_image: contactImage,
                messages,
                draft_message: draftMessage,
                lang,
                tags: tags || [],
                status: status || 'draft',
                scheduled_at: scheduledAt,
                published_at: publishedAt,
                author_notes: authorNotes,
            })
            .select()
            .single()

        if (error) {
            console.error('[Text Messages API] Error creating text message:', error)
            return res.status(500).json({ error: error.message })
        }

        res.status(201).json({ textMessage: transformTextMessageRow(data) })
    } catch (error: any) {
        console.error('[Text Messages API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PUT /api/text-messages/:id (Admin only)
 * Update a text message
 */
textMessagesRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const {
            title,
            contactName,
            contactImage,
            messages,
            draftMessage,
            lang,
            tags,
            status,
            scheduledAt,
            publishedAt,
            authorNotes,
        } = req.body

        // Build update object
        const updates: any = {}
        if (title !== undefined) updates.title = title
        if (contactName !== undefined) updates.contact_name = contactName
        if (contactImage !== undefined) updates.contact_image = contactImage
        if (messages !== undefined) {
            if (!Array.isArray(messages)) {
                return res.status(400).json({ error: 'Messages must be an array' })
            }
            const validation = validateMessages(messages)
            if (!validation.valid) {
                return res.status(400).json({ error: validation.error })
            }
            updates.messages = messages
        }
        if (draftMessage !== undefined) {
            if (draftMessage.length > 150) {
                return res.status(400).json({
                    error: `Draft message exceeds 150 character limit (${draftMessage.length} characters)`,
                })
            }
            updates.draft_message = draftMessage
        }
        if (lang !== undefined) updates.lang = lang
        if (tags !== undefined) updates.tags = tags
        if (status !== undefined) updates.status = status
        if (scheduledAt !== undefined) updates.scheduled_at = scheduledAt
        if (publishedAt !== undefined) updates.published_at = publishedAt
        if (authorNotes !== undefined) updates.author_notes = authorNotes

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' })
        }

        // Update in database
        const { data, error } = await supabase
            .from('text_messages')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('[Text Messages API] Error updating text message:', error)
            return res.status(500).json({ error: error.message })
        }

        if (!data) {
            return res.status(404).json({ error: 'Text message not found' })
        }

        res.json({ textMessage: transformTextMessageRow(data) })
    } catch (error: any) {
        console.error('[Text Messages API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * DELETE /api/text-messages/:id (Admin only)
 * Delete a text message
 */
textMessagesRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const { error } = await supabase.from('text_messages').delete().eq('id', id)

        if (error) {
            console.error('[Text Messages API] Error deleting text message:', error)
            return res.status(500).json({ error: error.message })
        }

        res.json({ success: true })
    } catch (error: any) {
        console.error('[Text Messages API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default textMessagesRouter
