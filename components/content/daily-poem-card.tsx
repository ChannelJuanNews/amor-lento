import { ScheduledContent } from "@/lib/types/content-schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from 'lucide-react'

interface DailyPoemCardProps {
    content: ScheduledContent
}

export function DailyPoemCard({ content }: DailyPoemCardProps) {
    const publishedDate = new Date(content.publishedAt || content.scheduledAt || "")

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                        Daily Poem
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {publishedDate.toLocaleDateString(content.lang === "es" ? "es-ES" : "en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>
                </div>
                <CardTitle className="font-serif text-2xl">{content.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-rose max-w-none">
                    <p className="text-muted-foreground italic mb-4">{content.excerpt}</p>
                    <div
                        className="font-serif leading-relaxed [&>p]:mb-4"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                    />
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
