"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { PoemCard } from "@/components/core/poem-card"
import { Button } from "@/components/ui/button"
import { getPoems } from "@/lib/poems"
import type { Poem } from "@/lib/types/poem"

interface PoemsListClientProps {
    initialPoems: Poem[]
    initialTotal: number
    initialHasMore: boolean
}

export function PoemsListClient({ initialPoems, initialTotal, initialHasMore }: PoemsListClientProps) {
    const [poems, setPoems] = useState<Poem[]>(initialPoems)
    const [filter, setFilter] = useState<"all" | "en" | "es">("all")
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(initialTotal)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [error, setError] = useState<string | null>(null)
    const observerTarget = useRef<HTMLDivElement>(null)
    const isInitialMount = useRef(true)

    const loadPoems = useCallback(async (pageNum: number, reset = false) => {
        setLoading(true)
        setError(null)

        try {
            const lang = filter === "all" ? undefined : filter
            const response = await getPoems({ page: pageNum, limit: 10, lang })

            if (reset) {
                setPoems(response.poems)
            } else {
                setPoems((prev) => [...prev, ...response.poems])
            }

            setTotal(response.pagination.total)
            setHasMore(response.pagination.hasMore)
            setPage(pageNum)
        } catch (err: any) {
            setError(err.message || "Failed to load poems")
        } finally {
            setLoading(false)
        }
    }, [filter])

    // Load poems when filter changes (but not on initial mount - we already have server data)
    useEffect(() => {
        // Skip the effect on initial mount since we already have server-rendered data
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        setPage(1)
        setPoems([])
        setHasMore(true)
        loadPoems(1, true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!hasMore || loading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadPoems(page + 1, false)
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
    }, [hasMore, loading, page, loadPoems])

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
            {poems.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    {poems.length} poems out of {total}
                </div>
            )}

            {/* Poems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {poems.map((poem) => (
                    <PoemCard key={poem.slug || poem.id} poem={poem} />
                ))}
            </div>

            {/* Loading State */}
            {loading && poems.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading poems...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && poems.length === 0 && !error && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No poems found with the selected filter.</p>
                </div>
            )}

            {/* End Message */}
            {!hasMore && poems.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground font-medium">You are at the end of the poems</p>
                </div>
            )}

            {/* Observer Target for Lazy Loading */}
            {hasMore && !loading && poems.length > 0 && (
                <div ref={observerTarget} className="h-10" />
            )}

            {/* Loading More Indicator */}
            {loading && poems.length > 0 && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">Loading more poems...</p>
                </div>
            )}
        </>
    )
}
