"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScheduledContent, ContentType, ContentStatus } from "@/lib/types/content-schedule"
import { CalendarIcon, ChevronLeft, ChevronRight, FileText, Heart } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"

interface ContentCalendarProps {
  content: ScheduledContent[]
  onDateClick?: (date: Date) => void
  onContentClick?: (content: ScheduledContent) => void
}

export function ContentCalendar({ content, onDateClick, onContentClick }: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const contentByDate = useMemo(() => {
    const map = new Map<string, ScheduledContent[]>()
    const seenItems = new Set<string>() // Track items we've already added to prevent duplicates
    
    content.forEach((item) => {
      let dateKey: string | null = null
      
      // Prioritize scheduledAt (date-only), fallback to publishedAt (datetime with timezone)
      if (item.scheduledAt) {
        // scheduledAt is date-only (YYYY-MM-DD), use it directly
        dateKey = item.scheduledAt.includes('T') 
          ? item.scheduledAt.split('T')[0] 
          : item.scheduledAt
      } else if (item.publishedAt) {
        // publishedAt is datetime with timezone - extract date in UTC to avoid timezone shifts
        const date = new Date(item.publishedAt)
        // Use UTC methods to get the date part, preserving the original date regardless of local timezone
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        dateKey = `${year}-${month}-${day}`
      }
      
      if (dateKey) {
        const itemKey = `${item.id}-${dateKey}` // Unique key for this item on this date
        
        // Only add if we haven't seen this item on this date before
        if (!seenItems.has(itemKey)) {
          if (!map.has(dateKey)) {
            map.set(dateKey, [])
          }
          map.get(dateKey)!.push(item)
          seenItems.add(itemKey)
        }
      }
    })
    return map
  }, [content])

  const getContentForDate = (date: Date): ScheduledContent[] => {
    const dateKey = format(date, "yyyy-MM-dd")
    return contentByDate.get(dateKey) || []
  }

  const getStatusColor = (status: ContentStatus): string => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-700 dark:text-green-400"
      case "scheduled":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400"
      case "draft":
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
      case "archived":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-400"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
    }
  }

  const getTypeIcon = (type: ContentType) => {
    return type === "daily-poem" ? <FileText className="h-3 w-3" /> : <Heart className="h-3 w-3" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentMonth, "MMMM yyyy")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayContent = getContentForDate(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[100px] border rounded-md p-1 cursor-pointer
                  transition-colors hover:bg-muted/50
                  ${!isCurrentMonth ? "opacity-30" : ""}
                  ${isToday ? "ring-2 ring-primary" : ""}
                `}
                onClick={() => onDateClick?.(day)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayContent.slice(0, 2).map((item) => (
                    <Badge
                      key={item.id}
                      className={`text-xs w-full justify-start gap-1 cursor-pointer ${getStatusColor(item.status)}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onContentClick?.(item)
                      }}
                    >
                      {getTypeIcon(item.type)}
                      <span className="truncate">{item.title}</span>
                    </Badge>
                  ))}
                  {dayContent.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayContent.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

