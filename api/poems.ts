import { Router, Request, Response } from 'express'
import supabase from '@/lib/supabase'

const poemsRouter = Router()

/**
 * GET /api/poems
 * Get paginated poems
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

    // Build query
    let query = supabase
      .from('poems')
      .select('*', { count: 'exact' })
      .eq('published', true) // Only get published poems
      .order('published_at', { ascending: false })

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

    res.json({
      poems: data || [],
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

export default poemsRouter

