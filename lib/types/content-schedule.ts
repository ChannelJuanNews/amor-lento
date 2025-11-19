export type ContentType = "daily-poem" | "weekly-love-letter"
export type ContentStatus = "draft" | "scheduled" | "published" | "archived"
export type RecurrenceType = "once" | "daily" | "weekly" | "monthly"

export interface ScheduledContent {
  id: string
  type: ContentType
  status: ContentStatus
  title: string
  content: string
  excerpt: string
  lang: "en" | "es"
  tags: string[]
  
  // Scheduling
  scheduledAt?: string
  publishedAt?: string
  recurrence?: {
    type: RecurrenceType
    dayOfWeek?: number // 0-6, for weekly
    dayOfMonth?: number // 1-31, for monthly
    endDate?: string
  }
  
  // Metadata
  createdAt: string
  updatedAt: string
  authorNotes?: string
}

export interface ContentCalendarEvent {
  id: string
  title: string
  type: ContentType
  status: ContentStatus
  date: string
  content: ScheduledContent
}
