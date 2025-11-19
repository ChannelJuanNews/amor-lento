import { Router, Request, Response } from 'express'
import supabase from '@/lib/supabase'

const scheduledContentRouter = Router()

/**
 * GET /api/scheduled-content
 * Get all scheduled content (public - only published/scheduled content)
 */
scheduledContentRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('scheduled_content')
      .select('*')
      .in('status', ['published', 'scheduled'])
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('[Scheduled Content API] Error:', error)
      return res.status(500).json({ error: error.message })
    }

    res.json(data || [])
  } catch (error: any) {
    console.error('[Scheduled Content API] Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default scheduledContentRouter

