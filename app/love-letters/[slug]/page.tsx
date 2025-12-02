"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { LocaleProvider } from "@/lib/i18n/locale-context"
import { LoveLetterCard } from "@/components/content/love-letter-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { apiCall } from "@/lib/api-client"
import type { ScheduledContent } from "@/lib/types/content-schedule"
import { AudioPlayer } from "@/components/core/audio-player"

function LoveLetterDetailContent() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [loveLetter, setLoveLetter] = useState<ScheduledContent | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchLoveLetter = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await apiCall<{ loveLetter: ScheduledContent }>(`/love-letters/${slug}`)
                setLoveLetter(response.loveLetter)
            } catch (err: any) {
                setError(err.message || "Failed to load love letter")
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchLoveLetter()
        }
    }, [slug])

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto text-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading love letter...</p>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    if (error || !loveLetter) {
        return (
            <>
                <Navbar />
                <main className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto text-center py-20">
                        <p className="text-red-600 mb-4">{error || "Love letter not found"}</p>
                        <Button variant="outline" onClick={() => router.push("/love-letters")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Love Letters
                        </Button>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    // Get audio URL if available
    const audioUrl = loveLetter.audioSrc
        ? loveLetter.audioSrc.startsWith('http://') || loveLetter.audioSrc.startsWith('https://')
            ? loveLetter.audioSrc
            : `/api/love-letters/${slug}/audio`
        : null

    return (
        <>
            <Navbar />
            <main className="container mx-auto px-4 py-12 pb-24">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Button variant="ghost" onClick={() => router.push("/love-letters")} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Love Letters
                    </Button>
                    <LoveLetterCard content={loveLetter} preview={false} />
                </div>
            </main>
            <Footer />
            {audioUrl && (
                <AudioPlayer audioUrl={audioUrl} title={loveLetter.title} />
            )}
        </>
    )
}

export default function LoveLetterDetailPage() {
    return (
        <LocaleProvider>
            <LoveLetterDetailContent />
        </LocaleProvider>
    )
}

