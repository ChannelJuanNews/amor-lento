import { ScheduledContent } from "@/lib/types/content-schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ArrowRight } from 'lucide-react'
import Link from "next/link"

interface LoveLetterCardProps {
    content: ScheduledContent
    preview?: boolean
}

// Helper function to create URL-friendly slug from title
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

// Helper function to strip HTML and get text preview (SSR-safe)
function getTextPreview(html: string, maxLength: number = 200): string {
    if (typeof window === 'undefined') {
        // Server-side: simple regex to strip HTML tags
        const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        if (text.length <= maxLength) return text
        return text.slice(0, maxLength).trim() + '...'
    }
    // Client-side: use DOM
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const text = tempDiv.textContent || tempDiv.innerText || ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
}

export function LoveLetterCard({ content, preview = true }: LoveLetterCardProps) {
    // Handle date parsing - scheduledAt is date-only, publishedAt is datetime
    let publishedDate: Date | null = null
    if (content.publishedAt) {
        publishedDate = new Date(content.publishedAt)
    } else if (content.scheduledAt) {
        // scheduledAt is date-only (YYYY-MM-DD), so we need to create a proper date
        const dateStr = content.scheduledAt
        // If it's already a full ISO string, use it directly
        // Otherwise, treat it as date-only and create a date at midnight UTC
        if (dateStr.includes('T')) {
            publishedDate = new Date(dateStr)
        } else {
            // Date-only format: append time to make it a valid date
            publishedDate = new Date(`${dateStr}T00:00:00Z`)
        }
    }
    
    // Fallback to current date if no date is available
    const displayDate = publishedDate && !isNaN(publishedDate.getTime()) 
        ? publishedDate 
        : new Date()
    
    const slug = createSlug(content.title)

    // For preview mode, show only excerpt and a preview of content
    const showPreview = preview
    const contentPreview = showPreview ? getTextPreview(content.content, 200) : null

    return (
        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs bg-secondary/20 text-secondary">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Weekly Love Letter
                    </Badge>
                    {displayDate && (
                        <div className="text-xs text-muted-foreground">
                            {displayDate.toLocaleDateString(content.lang === "es" ? "es-ES" : "en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </div>
                    )}
                </div>
                <CardTitle className="font-serif text-2xl">{content.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-rose max-w-none">
                    {content.excerpt && (
                        <p className="text-muted-foreground italic mb-4">{content.excerpt}</p>
                    )}
                    {showPreview ? (
                        <>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                {contentPreview}
                            </p>
                            <Button asChild variant="outline" className="mt-4">
                                <Link href={`/love-letters/${slug}`}>
                                    View Letter
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <div
                            className="leading-relaxed [&>p]:mb-4"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                        />
                    )}
                </div>
                {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                        {content.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
