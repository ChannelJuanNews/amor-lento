import { apiCall } from "./api-client"
import type { ScheduledContent } from "./types/content-schedule"

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
  tag?: string
}

/**
 * Fetch paginated love letters from the API
 */
export async function getLoveLetters(params: GetLoveLettersParams = {}): Promise<LoveLettersResponse> {
  const { page = 1, limit = 10, lang, tag } = params

  const queryParams = new URLSearchParams()
  queryParams.set('page', page.toString())
  queryParams.set('limit', limit.toString())
  if (lang) queryParams.set('lang', lang)
  if (tag) queryParams.set('tag', tag)

  return apiCall<LoveLettersResponse>(`/love-letters?${queryParams.toString()}`)
}

