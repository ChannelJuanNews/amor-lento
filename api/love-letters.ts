import { Router, Request, Response } from 'express'
import supabase from '@/lib/supabase'

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

    // Build query - get weekly love letters from scheduled_content table
    let query = supabase
      .from('scheduled_content')
      .select('*', { count: 'exact' })
      .eq('type', 'weekly-love-letter')
      .in('status', ['published', 'scheduled']) // Get published or scheduled
      .order('published_at', { ascending: false })
      .order('scheduled_at', { ascending: false })

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
 * GET /api/love-letters/:slug
 * Get a single love letter by slug
 */
loveLettersRouter.get('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params

        // Get all published love letters
        const { data, error } = await supabase
            .from('scheduled_content')
            .select('*')
            .eq('type', 'weekly-love-letter')
            .in('status', ['published', 'scheduled'])

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

