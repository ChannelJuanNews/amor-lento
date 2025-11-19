"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScheduledContent, ContentType, ContentStatus } from "@/lib/types/content-schedule"
import { apiCall } from "@/lib/api-client"
import { FileText, Heart, Search, Edit, Trash2, Eye, CalendarIcon } from "lucide-react"

interface ContentListProps {
  content: ScheduledContent[]
  onEdit?: (content: ScheduledContent) => void
  onDelete?: (content: ScheduledContent) => void
  onRefresh?: () => void
}

export function ContentList({ content, onEdit, onDelete, onRefresh }: ContentListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<ContentType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<ContentStatus | "all">("all")
  const [filterLang, setFilterLang] = useState<"en" | "es" | "all">("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = filterType === "all" || item.type === filterType
      const matchesStatus = filterStatus === "all" || item.status === filterStatus
      const matchesLang = filterLang === "all" || item.lang === filterLang

      return matchesSearch && matchesType && matchesStatus && matchesLang
    })
  }, [content, searchTerm, filterType, filterStatus, filterLang])

  const handleDelete = async (item: ScheduledContent) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return
    }

    setDeletingId(item.id)
    try {
      await apiCall(`/admin/content/${item.id}`, {
        method: "DELETE",
      })
      onRefresh?.()
    } catch (error: any) {
      console.error("Error deleting content:", error)
      alert(error.message || "Failed to delete content")
    } finally {
      setDeletingId(null)
    }
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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Content ({filteredContent.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ContentType | "all")}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="daily-poem">Daily Poem</option>
              <option value="weekly-love-letter">Weekly Love Letter</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ContentStatus | "all")}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value as "en" | "es" | "all")}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          {/* Content Table */}
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Title</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Language</th>
                    <th className="text-left p-3 text-sm font-medium">Scheduled</th>
                    <th className="text-left p-3 text-sm font-medium">Published</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No content found
                      </td>
                    </tr>
                  ) : (
                    filteredContent.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{item.excerpt}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {item.type === "daily-poem" ? (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Heart className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm capitalize">{item.type.replace("-", " ")}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{item.lang.toUpperCase()}</Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatDate(item.scheduledAt)}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatDate(item.publishedAt)}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit?.(item)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              disabled={deletingId === item.id}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

