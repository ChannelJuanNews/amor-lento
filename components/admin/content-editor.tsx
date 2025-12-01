"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { ScheduledContent, ContentType, ContentStatus, RecurrenceType } from "@/lib/types/content-schedule"
import { apiCall } from "@/lib/api-client"
import { Save, X, Loader2 } from "lucide-react"

interface ContentEditorProps {
  content?: ScheduledContent | null
  onSave?: (content: ScheduledContent) => void
  onCancel?: () => void
}

// Common timezones for the dropdown
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Mexico_City", label: "Mexico City (CST)" },
  { value: "America/Bogota", label: "Bogotá (COT)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (ART)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Madrid", label: "Madrid (CET)" },
  { value: "UTC", label: "UTC" },
]

export function ContentEditor({ content, onSave, onCancel }: ContentEditorProps) {
  const [loading, setLoading] = useState(false)
  const [publishedTimezone, setPublishedTimezone] = useState("America/New_York")
  const [formData, setFormData] = useState<Partial<ScheduledContent>>({
    type: "daily-poem",
    status: "draft",
    title: "",
    content: "",
    excerpt: "",
    lang: "en",
    tags: [],
    scheduledAt: undefined,
    publishedAt: undefined,
    recurrence: undefined,
    authorNotes: "",
    audioSrc: "",
  })

  // Helper function to format date-only (YYYY-MM-DD)
  const formatDateOnly = (dateString?: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().slice(0, 10)
  }

  // Helper function to format datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (dateString?: string, timezone?: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    // Convert to the selected timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const parts = formatter.formatToParts(date)
    const year = parts.find((p) => p.type === "year")?.value
    const month = parts.find((p) => p.type === "month")?.value
    const day = parts.find((p) => p.type === "day")?.value
    const hour = parts.find((p) => p.type === "hour")?.value
    const minute = parts.find((p) => p.type === "minute")?.value
    return `${year}-${month}-${day}T${hour}:${minute}`
  }

  // Helper function to create ISO string with timezone
  // Takes a datetime-local string (YYYY-MM-DDTHH:mm) and interprets it as being in the specified timezone
  const createDateTimeWithTimezone = (dateTimeLocal: string, timezone: string): string => {
    if (!dateTimeLocal) return ""
    
    // Parse the datetime-local string
    const [datePart, timePart] = dateTimeLocal.split("T")
    const [year, month, day] = datePart.split("-").map(Number)
    const [hour, minute] = timePart.split(":").map(Number)

    // Create a date string in ISO format
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
    
    // Method: Create a date in UTC, then find what UTC time would display as our desired time in the target timezone
    // Then adjust backwards
    
    // Step 1: Create a reference UTC date
    const testUTC = new Date(`${dateStr}Z`)
    
    // Step 2: Format this UTC date in the target timezone to see what it represents there
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    
    const parts = formatter.formatToParts(testUTC)
    const tzYear = parseInt(parts.find((p) => p.type === "year")?.value || "0")
    const tzMonth = parseInt(parts.find((p) => p.type === "month")?.value || "0")
    const tzDay = parseInt(parts.find((p) => p.type === "day")?.value || "0")
    const tzHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0")
    const tzMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0")
    
    // Step 3: Calculate how many hours/minutes difference between desired and actual
    const desired = new Date(Date.UTC(year, month - 1, day, hour, minute))
    const actual = new Date(Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute))
    
    // Step 4: The offset tells us how much to adjust
    const offsetMs = desired.getTime() - actual.getTime()
    
    // Step 5: Apply the offset to get the correct UTC time
    const result = new Date(testUTC.getTime() + offsetMs)
    
    return result.toISOString()
  }

  useEffect(() => {
    if (content) {
      setFormData({
        type: content.type,
        status: content.status,
        title: content.title || "",
        content: content.content || "",
        excerpt: content.excerpt || "",
        lang: content.lang,
        tags: content.tags || [],
        scheduledAt: content.scheduledAt,
        publishedAt: content.publishedAt,
        recurrence: content.recurrence,
        authorNotes: content.authorNotes || "",
        audioSrc: content.audioSrc || "",
      })
      // Extract timezone from publishedAt if it exists
      if (content.publishedAt) {
        // Try to detect timezone from the date string
        // Default to America/New_York if we can't detect
        setPublishedTimezone("America/New_York")
      }
    } else {
      // Reset form for new content
      setFormData({
        type: "daily-poem",
        status: "draft",
        title: "",
        content: "",
        excerpt: "",
        lang: "en",
        tags: [],
        scheduledAt: undefined,
        publishedAt: undefined,
        recurrence: undefined,
        authorNotes: "",
        audioSrc: "",
      })
      setPublishedTimezone("America/New_York")
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Format scheduled_at as date-only (YYYY-MM-DD)
      let scheduledAtFormatted: string | null = null
      if (formData.scheduledAt) {
        const date = new Date(formData.scheduledAt)
        scheduledAtFormatted = date.toISOString().slice(0, 10)
      }

      // Format published_at as ISO string with timezone
      let publishedAtFormatted: string | null = null
      if (formData.publishedAt) {
        publishedAtFormatted = formData.publishedAt
      }

      const payload: any = {
        type: formData.type,
        status: formData.status,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        lang: formData.lang,
        tags: formData.tags || [],
        scheduled_at: scheduledAtFormatted,
        published_at: publishedAtFormatted,
        recurrence: formData.recurrence || null,
        author_notes: formData.authorNotes || null,
        audioSrc: formData.audioSrc || null,
      }

      let savedContent: ScheduledContent
      if (content?.id) {
        // Update existing
        const response = await apiCall<{ content: ScheduledContent }>(`/admin/content/${content.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
        savedContent = response.content
      } else {
        // Create new
        const response = await apiCall<{ content: ScheduledContent }>("/admin/content", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        savedContent = response.content
      }

      onSave?.(savedContent)
    } catch (error: any) {
      console.error("Error saving content:", error)
      const errorMessage = error.message || error.error || "Failed to save content"
      const errorDetails = error.details ? `\n\nDetails: ${JSON.stringify(error.details, null, 2)}` : ""
      alert(`${errorMessage}${errorDetails}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(",").map((tag) => tag.trim()).filter(Boolean)
    setFormData({ ...formData, tags })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content ? "Edit Content" : "Create New Content"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="daily-poem">Daily Poem</option>
                <option value="weekly-love-letter">Weekly Love Letter</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lang">Language</Label>
              <select
                id="lang"
                value={formData.lang}
                onChange={(e) => setFormData({ ...formData, lang: e.target.value as "en" | "es" })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="love, poetry, romance"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              required
              placeholder="Short excerpt or summary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <TiptapEditor
              content={formData.content || ""}
              onChange={(html) => setFormData({ ...formData, content: html })}
              placeholder="Write your content here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Scheduled At (Date Only)</Label>
              <Input
                id="scheduledAt"
                type="date"
                value={formatDateOnly(formData.scheduledAt)}
                onChange={(e) => {
                  const dateValue = e.target.value
                  setFormData({
                    ...formData,
                    scheduledAt: dateValue ? `${dateValue}T00:00:00Z` : undefined,
                  })
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">Published At (Date & Time)</Label>
              <div className="space-y-2">
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formatDateTimeLocal(formData.publishedAt, publishedTimezone)}
                  onChange={(e) => {
                    const dateTimeValue = e.target.value
                    if (dateTimeValue) {
                      // Create ISO string assuming the datetime is in the selected timezone
                      const isoString = createDateTimeWithTimezone(dateTimeValue, publishedTimezone)
                      setFormData({
                        ...formData,
                        publishedAt: isoString,
                      })
                    } else {
                      setFormData({
                        ...formData,
                        publishedAt: undefined,
                      })
                    }
                  }}
                />
                <select
                  value={publishedTimezone}
                  onChange={(e) => {
                    setPublishedTimezone(e.target.value)
                    // Re-format the publishedAt with the new timezone
                    if (formData.publishedAt) {
                      const localDateTime = formatDateTimeLocal(formData.publishedAt, e.target.value)
                      if (localDateTime) {
                        const isoString = createDateTimeWithTimezone(localDateTime, e.target.value)
                        setFormData({
                          ...formData,
                          publishedAt: isoString,
                        })
                      }
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrenceType">Recurrence Type</Label>
            <select
              id="recurrenceType"
              value={formData.recurrence?.type || ""}
              onChange={(e) => {
                const type = e.target.value as RecurrenceType | ""
                if (type) {
                  setFormData({
                    ...formData,
                    recurrence: {
                      type,
                      dayOfWeek: formData.recurrence?.dayOfWeek,
                      dayOfMonth: formData.recurrence?.dayOfMonth,
                      endDate: formData.recurrence?.endDate,
                    },
                  })
                } else {
                  setFormData({ ...formData, recurrence: undefined })
                }
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">None (One-time)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {formData.recurrence?.type === "weekly" && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week (0=Sunday, 6=Saturday)</Label>
              <Input
                id="dayOfWeek"
                type="number"
                min="0"
                max="6"
                value={formData.recurrence?.dayOfWeek ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurrence: {
                      ...formData.recurrence!,
                      dayOfWeek: parseInt(e.target.value) || undefined,
                    },
                  })
                }
              />
            </div>
          )}

          {formData.recurrence?.type === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Day of Month (1-31)</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={formData.recurrence?.dayOfMonth ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurrence: {
                      ...formData.recurrence!,
                      dayOfMonth: parseInt(e.target.value) || undefined,
                    },
                  })
                }
              />
            </div>
          )}

          {formData.recurrence && (
            <div className="space-y-2">
              <Label htmlFor="recurrenceEndDate">Recurrence End Date</Label>
              <Input
                id="recurrenceEndDate"
                type="date"
                value={formData.recurrence?.endDate ? new Date(formData.recurrence.endDate).toISOString().slice(0, 10) : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurrence: {
                      ...formData.recurrence!,
                      endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    },
                  })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="audioSrc">Audio Source</Label>
            <Input
              id="audioSrc"
              value={formData.audioSrc || ""}
              onChange={(e) => setFormData({ ...formData, audioSrc: e.target.value })}
              placeholder="audio/2025/november/file.mp3 or https://example.com/audio.mp3"
            />
            <p className="text-xs text-muted-foreground">
              Enter a relative path from project root (e.g., "audio/2025/november/file.mp3") or a full URL for remote storage.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorNotes">Author Notes (Internal)</Label>
            <textarea
              id="authorNotes"
              value={formData.authorNotes || ""}
              onChange={(e) => setFormData({ ...formData, authorNotes: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              placeholder="Internal notes about this content..."
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

