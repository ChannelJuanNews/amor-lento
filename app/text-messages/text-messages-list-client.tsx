"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTextMessages } from "@/lib/text-messages"
import type { TextMessage } from "@/lib/types/text-message"
import Link from "next/link"
import { MessageSquare, ArrowRight } from "lucide-react"

interface TextMessagesListClientProps {
    initialTextMessages: TextMessage[]
    initialTotal: number
    initialHasMore: boolean
}

// Helper function to create URL-friendly slug from title
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

export function TextMessagesListClient({
    initialTextMessages,
    initialTotal,
    initialHasMore,
}: TextMessagesListClientProps) {
    const [textMessages, setTextMessages] = useState<TextMessage[]>(initialTextMessages)
    const [filter, setFilter] = useState<"all" | "en" | "es">("all")
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(initialTotal)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [error, setError] = useState<string | null>(null)
    const observerTarget = useRef<HTMLDivElement>(null)
    const isInitialMount = useRef(true)

    const loadTextMessages = useCallback(
        async (pageNum: number, reset = false) => {
            setLoading(true)
            setError(null)

            try {
                const lang = filter === "all" ? undefined : filter
                const response = await getTextMessages({ page: pageNum, limit: 10, lang })

                if (reset) {
                    setTextMessages(response.textMessages)
                } else {
                    setTextMessages((prev) => [...prev, ...response.textMessages])
                }

                setTotal(response.pagination.total)
                setHasMore(response.pagination.hasMore)
                setPage(pageNum)
            } catch (err: any) {
                setError(err.message || "Failed to load text messages")
            } finally {
                setLoading(false)
            }
        },
        [filter]
    )

    // Load text messages when filter changes (but not on initial mount - we already have server data)
    useEffect(() => {
        // Skip the effect on initial mount since we already have server-rendered data
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        setPage(1)
        setTextMessages([])
        setHasMore(true)
        loadTextMessages(1, true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!hasMore || loading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadTextMessages(page + 1, false)
                }
            },
            { threshold: 0.1 }
        )

        const currentTarget = observerTarget.current
        if (currentTarget) {
            observer.observe(currentTarget)
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget)
            }
        }
    }, [hasMore, loading, page, loadTextMessages])

    return (
        <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
                <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
                    All
                </Button>
                <Button variant={filter === "en" ? "default" : "outline"} onClick={() => setFilter("en")} size="sm">
                    English
                </Button>
                <Button variant={filter === "es" ? "default" : "outline"} onClick={() => setFilter("es")} size="sm">
                    Español
                </Button>
            </div>

            {/* Pagination Info */}
            {textMessages.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    {textMessages.length} text messages out of {total}
                </div>
            )}

            {/* Text Messages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {textMessages.map((textMessage) => {
                    const slug = createSlug(textMessage.title)
                    const messageCount = textMessage.messages.length
                    const lastMessage = textMessage.messages[textMessage.messages.length - 1]

                    return (
                        <Card key={textMessage.id} className="group hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="font-serif text-xl group-hover:text-secondary transition-colors">
                                        {textMessage.title}
                                    </CardTitle>
                                    <Badge variant="outline" className="shrink-0">
                                        {textMessage.lang.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                        {textMessage.contactImage ? (
                                            <img
                                                src={textMessage.contactImage}
                                                alt={textMessage.contactName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-semibold">
                                                {textMessage.contactName.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">{textMessage.contactName}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {messageCount} {messageCount === 1 ? "message" : "messages"}
                                        </div>
                                    </div>
                                </div>
                                {lastMessage && (
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                        {lastMessage.text}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {textMessage.tags.slice(0, 3).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <Link
                                    href={`/text-messages/${slug}`}
                                    className="inline-flex items-center text-sm text-secondary hover:underline font-medium"
                                >
                                    View Conversation
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Loading State */}
            {loading && textMessages.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading text messages...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && textMessages.length === 0 && !error && (
                <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No text messages found with the selected filter.</p>
                </div>
            )}

            {/* End Message */}
            {!hasMore && textMessages.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground font-medium">You are at the end of the text messages</p>
                </div>
            )}

            {/* Observer Target for Lazy Loading */}
            {hasMore && !loading && textMessages.length > 0 && <div ref={observerTarget} className="h-10" />}

            {/* Loading More Indicator */}
            {loading && textMessages.length > 0 && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">Loading more text messages...</p>
                </div>
            )}
        </>
    )
}
