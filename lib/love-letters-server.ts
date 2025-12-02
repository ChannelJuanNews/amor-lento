import { createClient } from '@supabase/supabase-js'
import type { ScheduledContent } from './types/content-schedule'
import { cache } from 'react'

const SUPABASE_URL = process.env.SUPABASE_URL || ""
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || ""

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  throw new Error("Missing environment variables: SUPABASE_URL or SUPABASE_API_KEY")
}

// Create Supabase client for server-side use
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY)

/**
 * Transform database row to ScheduledContent format
 */
function transformContentRow(row: any): ScheduledContent {
    return {
        id: row.id,
        type: row.type,
        title: row.title,
        content: row.content,
        excerpt: row.excerpt,
        lang: row.lang,
        tags: row.tags || [],
        scheduledAt: row.scheduled_at,
        publishedAt: row.published_at,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        audioSrc: row.audio_src || undefined,
    }
}

export interface LoveLettersResponse {
  loveLetters: ScheduledContent[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface GetLoveLettersParams {
  page?: number
  limit?: number
  lang?: "en" | "es"
}

/**
 * Fetch paginated love letters from Supabase (Server-side only)
 * This function is cached using React's cache() for deduplication
 */
export const getLoveLettersServer = cache(async (params: GetLoveLettersParams = {}): Promise<LoveLettersResponse> => {
    const { page = 1, limit = 10, lang } = params
    const offset = (page - 1) * limit
    const now = new Date().toISOString()

    // Build query - get love letters from scheduled_content table
    let query = supabase
        .from('scheduled_content')
        .select('*', { count: 'exact' })
        .eq('type', 'weekly-love-letter')
        .in('status', ['published', 'scheduled'])
        .or(`published_at.lte.${now},scheduled_at.lte.${now}`)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('scheduled_at', { ascending: false, nullsFirst: false })

    // Apply filters
    if (lang && (lang === 'en' || lang === 'es')) {
        query = query.eq('lang', lang)
    }

    // Get total count and paginated results
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
        console.error('[Love Letters Server] Error:', error)
        throw new Error(error.message)
    }

    // Transform the data to match ScheduledContent interface
    const transformed = (data || []).map(transformContentRow)

    return {
        loveLetters: transformed,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
            hasMore: offset + limit < (count || 0),
        },
    }
})
