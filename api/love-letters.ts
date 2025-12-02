import { Router, Request, Response } from 'express'
import supabase from '@/lib/supabase'
import path from 'path'
import fs from 'fs'

const loveLettersRouter = Router()

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
 * GET /api/love-letters
 * Get paginated love letters
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 *   - lang: filter by language ('en' | 'es')
 *   - tag: filter by tag
 */
loveLettersRouter.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const lang = req.query.lang as string | undefined
        const tag = req.query.tag as string | undefined

        const offset = (page - 1) * limit
        const now = new Date().toISOString()

        // Build query - get weekly love letters from scheduled_content table
        // Only show love letters that are actually published (published_at <= now) or scheduled (scheduled_at <= now)
        let query = supabase
            .from('scheduled_content')
            .select('*', { count: 'exact' })
            .eq('type', 'weekly-love-letter')
            .in('status', ['published', 'scheduled'])
            // Filter: published_at <= now OR scheduled_at <= now
            // This ensures we only show love letters that should be visible (not future-dated)
            .or(`published_at.lte.${now},scheduled_at.lte.${now}`)
            // Order by published_at first (descending), then scheduled_at (descending)
            // nullsFirst: false means NULL values come last, so love letters with published_at show first
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
        const { data, error, count } = await query
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('[Love Letters API] Error:', error)
            return res.status(500).json({ error: error.message })
        }

        // Transform the data to match frontend expectations
        const transformed = (data || []).map(transformContentRow)

        res.json({
            loveLetters: transformed,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasMore: offset + limit < (count || 0),
            },
        })
    } catch (error: any) {
        console.error('[Love Letters API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

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
 * GET /api/love-letters/:slug/audio
 * Serve audio file for a love letter
 * The audio file path is stored in the database (audio_src field)
 * NOTE: This route must be defined BEFORE /:slug to avoid route conflicts
 */
loveLettersRouter.get('/:slug/audio', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params
        const now = new Date().toISOString()

        // Get all published love letters to find the one matching the slug
        const { data, error } = await supabase
            .from('scheduled_content')
            .select('title, audio_src')
            .eq('type', 'weekly-love-letter')
            .in('status', ['published', 'scheduled'])
            .or(`published_at.lte.${now},scheduled_at.lte.${now}`)

        if (error) {
            console.error('[Love Letters API] Error fetching love letter:', error)
            return res.status(500).json({ error: error.message })
        }

        // Find the love letter that matches the slug
        const loveLetter = (data || []).find((letter) => {
            const letterSlug = createSlug(letter.title || '')
            return letterSlug === slug
        })

        if (!loveLetter || !loveLetter.audio_src) {
            return res.status(404).json({ error: 'Audio not found for this love letter' })
        }

        // Get the project root directory (one level up from dist/)
        const projectRoot = typeof __dirname !== 'undefined'
            ? path.resolve(__dirname, '..', '..')
            : process.cwd()

        // Construct the audio file path
        // audio_src can be a relative path from project root (e.g., "audio/2025/november/file.mp3")
        // or a full URL (for future remote storage)
        let audioPath: string

        // Check if it's a URL (starts with http:// or https://)
        if (loveLetter.audio_src.startsWith('http://') || loveLetter.audio_src.startsWith('https://')) {
            // For remote URLs, redirect to the URL
            return res.redirect(loveLetter.audio_src)
        }

        // It's a local file path
        audioPath = path.resolve(projectRoot, loveLetter.audio_src)

        // Security: Ensure the path is within the project root to prevent directory traversal
        const resolvedProjectRoot = path.resolve(projectRoot)
        if (!audioPath.startsWith(resolvedProjectRoot)) {
            console.error('[Love Letters API] Security: Attempted directory traversal:', audioPath)
            return res.status(403).json({ error: 'Invalid audio path' })
        }

        // Check if file exists
        if (!fs.existsSync(audioPath)) {
            console.error('[Love Letters API] Audio file not found:', audioPath)
            return res.status(404).json({ error: 'Audio file not found' })
        }

        // Set appropriate headers for audio streaming
        res.setHeader('Content-Type', 'audio/mpeg')
        res.setHeader('Accept-Ranges', 'bytes')
        res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year

        // Stream the file
        const fileStream = fs.createReadStream(audioPath)
        fileStream.pipe(res)

        fileStream.on('error', (err) => {
            console.error('[Love Letters API] Error streaming audio:', err)
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming audio file' })
            }
        })
    } catch (error: any) {
        console.error('[Love Letters API] Error:', error)
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' })
        }
    }
})

/**
 * GET /api/love-letters/:slug
 * Get a single love letter by slug
 */
loveLettersRouter.get('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params
        const now = new Date().toISOString()

        // Get all published love letters that should be visible
        const { data, error } = await supabase
            .from('scheduled_content')
            .select('*')
            .eq('type', 'weekly-love-letter')
            .in('status', ['published', 'scheduled'])
            .or(`published_at.lte.${now},scheduled_at.lte.${now}`)

        if (error) {
            console.error('[Love Letters API] Error fetching love letters:', error)
            return res.status(500).json({ error: error.message })
        }

        // Find the love letter that matches the slug
        const loveLetter = (data || []).find((letter) => {
            const letterSlug = createSlug(letter.title)
            return letterSlug === slug
        })

        if (!loveLetter) {
            return res.status(404).json({ error: 'Love letter not found' })
        }

        // Transform the data to match frontend expectations
        const transformed = transformContentRow(loveLetter)

        res.json({ loveLetter: transformed })
    } catch (error: any) {
        console.error('[Love Letters API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default loveLettersRouter

