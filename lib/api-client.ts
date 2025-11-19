"use client"

/**
 * Helper function to make authenticated API calls to Express routes
 * Cookies (including httpOnly auth tokens) are sent automatically by the browser
 */
export async function apiCall<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    }

    const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Include cookies in requests
    })

    if (!response.ok) {
        // For 401 Unauthorized, return empty object instead of throwing
        // This allows auth checks to handle missing sessions gracefully
        if (response.status === 401) {
            return {} as T
        }
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        const error = new Error(errorData.error || `API call failed: ${response.statusText}`)
        // Preserve error details for debugging
        ;(error as any).error = errorData.error
        ;(error as any).details = errorData.details
        throw error
    }

    return response.json()
}

