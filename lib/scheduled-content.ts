import { ScheduledContent } from "@/lib/types/content-schedule"

/**
 * Get all scheduled content from the API endpoint (server or client).
 * This returns a Promise that resolves to an array of ScheduledContent.
 */
export async function getAllScheduledContent(): Promise<ScheduledContent[]> {
  const res = await fetch("/api/scheduled-content", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    // Credentials, caching, etc. can be added as needed
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch scheduled content: ${res.statusText}`)
  }
  const data = await res.json()
  return data as ScheduledContent[]
}

/**
 * Get today's daily poem for the given locale (PST day).
 * Returns a Promise that resolves to the matching ScheduledContent or null.
 */
export async function getTodaysDailyPoem(locale: "en" | "es" = "en"): Promise<ScheduledContent | null> {
  const now = new Date()
  const pstDateString = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const pstDate = new Date(pstDateString)
  pstDate.setHours(0, 0, 0, 0) // start of today in PST

  const content = await getAllScheduledContent()
  const dailyPoem = content.find((item) => {
    if (item.type !== "daily-poem" || item.lang !== locale) {
      return false
    }

    const isPublished = item.status === "published"
    const isScheduled = item.status === "scheduled"

    if (!isPublished && !isScheduled) return false

    const itemDate = new Date(item.publishedAt || item.scheduledAt || "")
    const itemPSTString = itemDate.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const itemPST = new Date(itemPSTString)
    itemPST.setHours(0, 0, 0, 0)

    const isToday = itemPST.getTime() === pstDate.getTime()

    if (isScheduled) {
      return isToday && now >= itemDate
    }

    return isToday
  })

  return dailyPoem || null
}

/**
 * Get this week's love letter for the given locale (PST week).
 * Returns a Promise that resolves to the matching ScheduledContent or null.
 */
export async function getThisWeeksLoveLetter(locale: "en" | "es" = "en"): Promise<ScheduledContent | null> {
  const now = new Date()
  const pstDateString = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const pstDate = new Date(pstDateString)

  // PST week calculation (Sunday to Saturday)
  const startOfWeek = new Date(pstDate)
  startOfWeek.setDate(pstDate.getDate() - pstDate.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const content = await getAllScheduledContent()
  const loveLetter = content.find((item) => {
    if (item.type !== "weekly-love-letter" || item.lang !== locale) {
      return false
    }

    const isPublished = item.status === "published"
    const isScheduled = item.status === "scheduled"

    if (!isPublished && !isScheduled) return false

    const itemDate = new Date(item.publishedAt || item.scheduledAt || "")
    if (isScheduled && now < itemDate) return false

    const itemPSTString = itemDate.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const itemPST = new Date(itemPSTString)

    return itemPST >= startOfWeek && itemPST <= endOfWeek
  })

  return loveLetter || null
}
