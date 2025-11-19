"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiCall } from "@/lib/api-client"
import { Mail, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

interface WebhookEvent {
  id: string
  event_type: string
  email_id: string | null
  to_email: string | null
  from_email: string | null
  subject: string | null
  event_data: Record<string, any>
  received_at: string
  created_at: string
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  "email.sent": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "email.delivered": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "email.bounced": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "email.complained": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "email.opened": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "email.clicked": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
}

export default function WebhooksPage() {
  const { user } = useAuth()
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("")
  const [emailIdFilter, setEmailIdFilter] = useState<string>("")
  const limit = 50

  const fetchWebhooks = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })
      if (eventTypeFilter) params.append("event_type", eventTypeFilter)
      if (emailIdFilter) params.append("email_id", emailIdFilter)

      const data = await apiCall<{
        webhooks: WebhookEvent[]
        total: number
        limit: number
        offset: number
      }>(`/admin/webhooks?${params.toString()}`)

      setWebhooks(data.webhooks)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message || "Failed to load webhooks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchWebhooks()
    }
  }, [user, offset, eventTypeFilter, emailIdFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getEventTypeLabel = (eventType: string) => {
    return eventType.replace("email.", "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Resend Webhooks</h1>
          <p className="text-muted-foreground">View and monitor email webhook events from Resend</p>
        </div>
        <Button onClick={fetchWebhooks} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Type</label>
              <Input
                placeholder="e.g., email.sent, email.delivered"
                value={eventTypeFilter}
                onChange={(e) => {
                  setEventTypeFilter(e.target.value)
                  setOffset(0)
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email ID</label>
              <Input
                placeholder="Resend email ID"
                value={emailIdFilter}
                onChange={(e) => {
                  setEmailIdFilter(e.target.value)
                  setOffset(0)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Showing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offset + 1}-{Math.min(offset + limit, total)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading webhooks...</p>
          </CardContent>
        </Card>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No webhook events found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={EVENT_TYPE_COLORS[webhook.event_type] || "bg-gray-100 text-gray-800"}>
                          {getEventTypeLabel(webhook.event_type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(webhook.received_at)}
                        </span>
                      </div>
                      {webhook.subject && (
                        <CardTitle className="text-lg mb-1">{webhook.subject}</CardTitle>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {webhook.email_id && (
                      <div>
                        <span className="font-medium">Email ID:</span>{" "}
                        <code className="text-xs bg-muted px-2 py-1 rounded">{webhook.email_id}</code>
                      </div>
                    )}
                    {webhook.to_email && (
                      <div>
                        <span className="font-medium">To:</span> {webhook.to_email}
                      </div>
                    )}
                    {webhook.from_email && (
                      <div>
                        <span className="font-medium">From:</span> {webhook.from_email}
                      </div>
                    )}
                  </div>
                  {Object.keys(webhook.event_data).length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                        View Event Data
                      </summary>
                      <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                        {JSON.stringify(webhook.event_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

