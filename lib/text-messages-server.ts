import { createClient } from '@supabase/supabase-js'
import type { TextMessage } from './types/text-message'
import { cache } from 'react'

const SUPABASE_URL = process.env.SUPABASE_URL || ""
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || ""

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  throw new Error("Missing environment variables: SUPABASE_URL or SUPABASE_API_KEY")
}

// Create Supabase client for server-side use
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY)

/**
 * Transform database row to TextMessage format
 */
function transformTextMessageRow(row: any): TextMessage {
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
        scheduledAt: row.scheduled_at,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        authorNotes: row.author_notes || undefined,
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

export interface TextMessagesResponse {
  textMessages: TextMessage[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface GetTextMessagesParams {
  page?: number
  limit?: number
  lang?: "en" | "es"
  tag?: string
}

/**
 * Fetch paginated text messages from Supabase (Server-side only)
 * This function is cached using React's cache() for deduplication
 */
export const getTextMessagesServer = cache(async (params: GetTextMessagesParams = {}): Promise<TextMessagesResponse> => {
    const { page = 1, limit = 10, lang, tag } = params
    const offset = (page - 1) * limit
    const now = new Date().toISOString()

    // Build query - get text messages
    let query = supabase
        .from('text_messages')
        .select('*', { count: 'exact' })
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
        console.error('[Text Messages Server] Error:', error)
        throw new Error(error.message)
    }

    // Transform the data to match TextMessage interface
    const transformed = (data || []).map(transformTextMessageRow)

    return {
        textMessages: transformed,
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
 * Fetch a single text message by slug (Server-side only)
 * This function is cached using React's cache() for deduplication
 */
export const getTextMessageBySlugServer = cache(async (slug: string): Promise<TextMessage | null> => {
    const now = new Date().toISOString()

    // Get all published text messages that should be visible
    const { data, error } = await supabase
        .from('text_messages')
        .select('*')
        .in('status', ['published', 'scheduled'])
        .or(`published_at.lte.${now},scheduled_at.lte.${now}`)

    if (error) {
        console.error('[Text Messages Server] Error fetching text messages:', error)
        throw new Error(error.message)
    }

    // Find the message that matches the slug
    const textMessage = (data || []).find((msg) => {
        const msgSlug = createSlug(msg.title)
        return msgSlug === slug
    })

    if (!textMessage) {
        return null
    }

    // Transform the data to match frontend expectations
    return transformTextMessageRow(textMessage)
})
