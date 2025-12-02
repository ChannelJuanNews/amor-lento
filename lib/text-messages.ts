import { apiCall } from "./api-client"
import type { TextMessage, CreateTextMessageInput, UpdateTextMessageInput } from "./types/text-message"

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
 * Fetch paginated text messages from the API (client-side)
 */
export async function getTextMessages(params: GetTextMessagesParams = {}): Promise<TextMessagesResponse> {
  const { page = 1, limit = 10, lang, tag } = params

  const queryParams = new URLSearchParams()
  queryParams.set('page', page.toString())
  queryParams.set('limit', limit.toString())
  if (lang) queryParams.set('lang', lang)
  if (tag) queryParams.set('tag', tag)

  return apiCall<TextMessagesResponse>(`/text-messages?${queryParams.toString()}`)
}

/**
 * Fetch a single text message by slug (client-side)
 */
export async function getTextMessageBySlug(slug: string): Promise<{ textMessage: TextMessage }> {
  return apiCall<{ textMessage: TextMessage }>(`/text-messages/${slug}`)
}

/**
 * Create a new text message (Admin only)
 */
export async function createTextMessage(input: CreateTextMessageInput): Promise<{ textMessage: TextMessage }> {
  return apiCall<{ textMessage: TextMessage }>('/text-messages', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Update a text message (Admin only)
 */
export async function updateTextMessage(input: UpdateTextMessageInput): Promise<{ textMessage: TextMessage }> {
  const { id, ...updates } = input
  return apiCall<{ textMessage: TextMessage }>(`/text-messages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

/**
 * Delete a text message (Admin only)
 */
export async function deleteTextMessage(id: string): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>(`/text-messages/${id}`, {
    method: 'DELETE',
  })
}
