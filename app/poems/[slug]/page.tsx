import { notFound } from "next/navigation"
import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getPoemBySlugServer } from "@/lib/poems-server"
import type { Metadata } from "next"
import { PoemClientWrapper } from "./poem-client-wrapper"

interface PoemPageProps {
    params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PoemPageProps): Promise<Metadata> {
    const { slug } = await params
    const poem = await getPoemBySlugServer(slug)

    if (!poem) {
        return {
            title: "Poem Not Found",
        }
    }

    return {
        title: `${poem.title} | Amor Lento`,
        description: poem.excerpt || `Read "${poem.title}" - a ${poem.lang === "es" ? "Spanish" : "English"} poem from Amor Lento`,
        openGraph: {
            title: poem.title,
            description: poem.excerpt || `Read "${poem.title}"`,
            type: "article",
            locale: poem.lang === "es" ? "es_ES" : "en_US",
            publishedTime: poem.publishedAt,
            tags: poem.tags,
        },
        twitter: {
            card: "summary_large_image",
            title: poem.title,
            description: poem.excerpt || `Read "${poem.title}"`,
        },
    }
}

export default async function PoemDetailPage({ params }: PoemPageProps) {
    const { slug } = await params
    const poem = await getPoemBySlugServer(slug)

    if (!poem) {
        notFound()
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
                    <PoemClientWrapper />
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
                <PoemClientWrapper audioUrl={audioUrl} title={poem.title} />
            )}
        </>
    )
}
