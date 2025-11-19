import { apiCall } from "./api-client"
import type { Poem } from "./types/poem"

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
 * Fetch paginated poems from the API
 */
export async function getPoems(params: GetPoemsParams = {}): Promise<PoemsResponse> {
  const { page = 1, limit = 10, lang, tag } = params

  const queryParams = new URLSearchParams()
  queryParams.set('page', page.toString())
  queryParams.set('limit', limit.toString())
  if (lang) queryParams.set('lang', lang)
  if (tag) queryParams.set('tag', tag)

  return apiCall<PoemsResponse>(`/poems?${queryParams.toString()}`)
}

