import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Poem } from "@/lib/types/poem"

interface PoemCardProps {
    poem: Poem
}

export function PoemCard({ poem }: PoemCardProps) {
    return (
        <Card className="group hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-xl font-semibold group-hover:text-secondary transition-colors">
                        {poem.title}
                    </h3>
                    <Badge variant="outline" className="shrink-0">
                        {poem.lang.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3">{poem.excerpt}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {poem.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/poems/${poem.slug}`} className="text-sm text-secondary hover:underline font-medium">
                    Read More →
                </Link>
            </CardFooter>
        </Card>
    )
}
