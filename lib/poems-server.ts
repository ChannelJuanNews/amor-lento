import { createClient } from '@supabase/supabase-js'
import type { Poem } from './types/poem'
import { cache } from 'react'

const SUPABASE_URL = process.env.SUPABASE_URL || ""
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || ""

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  throw new Error("Missing environment variables: SUPABASE_URL or SUPABASE_API_KEY")
}

// Create Supabase client for server-side use
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY)

/**
 * Transform database row to Poem format
 */
function transformContentRow(row: any): Poem {
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
        featured: false,
        audioSrc: row.audio_src || undefined,
    }
}

/**
 * Helper function to create slug from title
 */
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

export interface PoemsResponse {
  poems: Poem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface GetPoemsParams {
  page?: number
  limit?: number
  lang?: "en" | "es"
  tag?: string
}

/**
 * Fetch paginated poems from Supabase (Server-side only)
 * This function is cached using React's cache() for deduplication
 */
export const getPoemsServer = cache(async (params: GetPoemsParams = {}): Promise<PoemsResponse> => {
    const { page = 1, limit = 10, lang, tag } = params
    const offset = (page - 1) * limit
    const now = new Date().toISOString()

    // Build query - get daily poems from scheduled_content table
    let query = supabase
        .from('scheduled_content')
        .select('*', { count: 'exact' })
        .eq('type', 'daily-poem')
        .in('status', ['published', 'scheduled'])
        .or(`published_at.lte.${now},scheduled_at.lte.${now}`)
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
        console.error('[Poems Server] Error:', error)
        throw new Error(error.message)
    }

    // Transform the data to match Poem interface
    const transformed = (data || []).map(transformContentRow)

    return {
        poems: transformed,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
            hasMore: offset + limit < (count || 0),
        },
    }
})

/**
 * Fetch a single poem by slug (Server-side only)
 * This function is cached using React's cache() for deduplication
 */
export const getPoemBySlugServer = cache(async (slug: string): Promise<Poem | null> => {
    const now = new Date().toISOString()

    // Get all published poems that should be visible
    const { data, error } = await supabase
        .from('scheduled_content')
        .select('*')
        .eq('type', 'daily-poem')
        .in('status', ['published', 'scheduled'])
        .or(`published_at.lte.${now},scheduled_at.lte.${now}`)

    if (error) {
        console.error('[Poems Server] Error fetching poems:', error)
        throw new Error(error.message)
    }

    // Find the poem that matches the slug
    const poem = (data || []).find((p) => {
        const poemSlug = createSlug(p.title)
        return poemSlug === slug
    })

    if (!poem) {
        return null
    }

    // Transform the data to match frontend expectations
    return transformContentRow(poem)
})
