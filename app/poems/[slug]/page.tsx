'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { LocaleProvider } from "@/lib/i18n/locale-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { apiCall } from "@/lib/api-client"
import type { Poem } from "@/lib/types/poem"
import { AudioPlayer } from "@/components/core/audio-player"

function PoemDetailContent() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [poem, setPoem] = useState<Poem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPoem = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await apiCall<{ poem: Poem }>(`/poems/${slug}`)
                setPoem(response.poem)
            } catch (err: any) {
                setError(err.message || "Failed to load poem")
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchPoem()
        }
    }, [slug])

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto text-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading poem...</p>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    if (error || !poem) {
        return (
            <>
                <Navbar />
                <main className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto text-center py-20">
                        <p className="text-red-600 mb-4">{error || "Poem not found"}</p>
                        <Button variant="outline" onClick={() => router.push("/poems")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Poems
                        </Button>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    // Handle date parsing - publishedAt is datetime
    let publishedDate: Date | null = null
    if (poem.publishedAt) {
        publishedDate = new Date(poem.publishedAt)
    }
    const displayDate = publishedDate && !isNaN(publishedDate.getTime()) 
        ? publishedDate 
        : null

    // Get audio URL if available
    const audioUrl = poem.audioSrc 
        ? poem.audioSrc.startsWith('http://') || poem.audioSrc.startsWith('https://')
            ? poem.audioSrc
            : `/api/poems/${slug}/audio`
        : null

    return (
        <>
            <Navbar />
            <main className="container mx-auto px-4 py-12 pb-24">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Button variant="ghost" onClick={() => router.push("/poems")} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Poems
                    </Button>
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">
                                    Daily Poem
                                </Badge>
                                {displayDate && (
                                    <div className="text-xs text-muted-foreground">
                                        {displayDate.toLocaleDateString(poem.lang === "es" ? "es-ES" : "en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </div>
                                )}
                            </div>
                            <h1 className="font-serif text-2xl md:text-3xl font-bold">{poem.title}</h1>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-rose max-w-none">
                                {poem.excerpt && (
                                    <p className="text-muted-foreground italic mb-4">{poem.excerpt}</p>
                                )}
                                <div
                                    className="font-serif leading-relaxed [&>p]:mb-4"
                                    dangerouslySetInnerHTML={{ __html: poem.content }}
                                />
                            </div>
                            {poem.tags && poem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                                    {poem.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
            {audioUrl && (
                <AudioPlayer audioUrl={audioUrl} title={poem.title} />
            )}
        </>
    )
}

export default function PoemDetailPage() {
    return (
        <LocaleProvider>
            <PoemDetailContent />
        </LocaleProvider>
    )
}

