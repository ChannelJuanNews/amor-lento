import { Router, Request, Response } from 'express'
import supabase from '@/lib/supabase'

const poemsRouter = Router()

/**
 * Transform database row to Poem format
 */
function transformContentRow(row: any): any {
    // Create slug from title
    const slug = row.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    return {
        id: row.id,
        slug: slug,
        title: row.title,
        content: row.content,
        excerpt: row.excerpt,
        lang: row.lang,
        tags: row.tags || [],
        publishedAt: row.published_at || row.scheduled_at || row.created_at,
        published: row.status === 'published' || row.status === 'scheduled',
        featured: false, // Can be added later if needed
    }
}

/**
 * GET /api/poems
 * Get paginated poems from scheduled_content table
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 *   - lang: filter by language ('en' | 'es')
 *   - tag: filter by tag
 */
poemsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const lang = req.query.lang as string | undefined
        const tag = req.query.tag as string | undefined

        const offset = (page - 1) * limit
        const now = new Date().toISOString()

        // Build query - get daily poems from scheduled_content table
        // Only show poems that are actually published (published_at <= now) or scheduled (scheduled_at <= now)
        let query = supabase
            .from('scheduled_content')
            .select('*', { count: 'exact' })
            .eq('type', 'daily-poem')
            .in('status', ['published', 'scheduled'])
            // Filter: published_at <= now OR scheduled_at <= now
            // This ensures we only show poems that should be visible (not future-dated)
            .or(`published_at.lte.${now},scheduled_at.lte.${now}`)
            // Order by published_at first (descending), then scheduled_at (descending)
            // nullsFirst: false means NULL values come last, so poems with published_at show first
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
            console.error('[Poems API] Error:', error)
            return res.status(500).json({ error: error.message })
        }

        // Transform the data to match Poem interface
        const transformed = (data || []).map(transformContentRow)

        res.json({
            poems: transformed,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasMore: offset + limit < (count || 0),
            },
        })
    } catch (error: any) {
        console.error('[Poems API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * Helper function to create slug from title (same as transformContentRow)
 */
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

/**
 * GET /api/poems/:slug
 * Get a single poem by slug
 */
poemsRouter.get('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params
        const now = new Date().toISOString()

        // Get all published poems that should be visible
        const { data, error } = await supabase
            .from('scheduled_content')
            .select('*')
            .eq('type', 'daily-poem')
            .in('status', ['published', 'scheduled'])
            .or(`published_at.lte.${now},scheduled_at.lte.${now}`)

        if (error) {
            console.error('[Poems API] Error fetching poems:', error)
            return res.status(500).json({ error: error.message })
        }

        // Find the poem that matches the slug
        const poem = (data || []).find((p) => {
            const poemSlug = createSlug(p.title)
            return poemSlug === slug
        })

        if (!poem) {
            return res.status(404).json({ error: 'Poem not found' })
        }

        // Transform the data to match frontend expectations
        const transformed = transformContentRow(poem)

        res.json({ poem: transformed })
    } catch (error: any) {
        console.error('[Poems API] Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default poemsRouter

