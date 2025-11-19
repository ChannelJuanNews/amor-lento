"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { LocaleProvider } from "@/lib/i18n/locale-context"
import { LoveLetterCard } from "@/components/content/love-letter-card"
import { Button } from "@/components/ui/button"
import { getLoveLetters } from "@/lib/love-letters"
import type { ScheduledContent } from "@/lib/types/content-schedule"

function LoveLettersContent() {
  const [loveLetters, setLoveLetters] = useState<ScheduledContent[]>([])
  const [filter, setFilter] = useState<"all" | "en" | "es">("all")
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadLoveLetters = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true)
    setError(null)

    try {
      const lang = filter === "all" ? undefined : filter
      const response = await getLoveLetters({ page: pageNum, limit: 10, lang })

      if (reset) {
        setLoveLetters(response.loveLetters)
      } else {
        setLoveLetters((prev) => [...prev, ...response.loveLetters])
      }

      setTotal(response.pagination.total)
      setHasMore(response.pagination.hasMore)
      setPage(pageNum)
    } catch (err: any) {
      setError(err.message || "Failed to load love letters")
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Load initial love letters
  useEffect(() => {
    setPage(1)
    setLoveLetters([])
    setHasMore(true)
    loadLoveLetters(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadLoveLetters(page + 1, false)
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
  }, [hasMore, loading, page, loadLoveLetters])

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold">Love Letters</h1>
            <p className="text-muted-foreground text-lg">Weekly love letters written at a human pace</p>
          </div>

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
          {loveLetters.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              {loveLetters.length} love letters out of {total}
            </div>
          )}

          {/* Love Letters Grid */}
          <div className="space-y-6">
            {loveLetters.map((letter) => (
              <LoveLetterCard key={letter.id} content={letter} />
            ))}
          </div>

          {/* Loading State */}
          {loading && loveLetters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading love letters...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && loveLetters.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No love letters found with the selected filter.</p>
            </div>
          )}

          {/* End Message */}
          {!hasMore && loveLetters.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-medium">You are at the end of the love letters</p>
            </div>
          )}

          {/* Observer Target for Lazy Loading */}
          {hasMore && !loading && loveLetters.length > 0 && (
            <div ref={observerTarget} className="h-10" />
          )}

          {/* Loading More Indicator */}
          {loading && loveLetters.length > 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">Loading more love letters...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function LoveLettersPage() {
  return (
    <LocaleProvider>
      <LoveLettersContent />
    </LocaleProvider>
  )
}

