import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { getTextMessageBySlugServer } from "@/lib/text-messages-server"
import { TextMessageClientWrapper } from "./text-message-client-wrapper"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"

interface TextMessagePageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: TextMessagePageProps): Promise<Metadata> {
    const { slug } = await params
    const textMessage = await getTextMessageBySlugServer(slug)

    if (!textMessage) {
        return {
            title: "Text Message Not Found",
        }
    }

    return {
        title: `${textMessage.title} | Text Messages | Amor Lento`,
        description: `iPhone text conversation with ${textMessage.contactName}`,
        openGraph: {
            title: textMessage.title,
            description: `iPhone text conversation with ${textMessage.contactName}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: textMessage.title,
            description: `iPhone text conversation with ${textMessage.contactName}`,
        },
    }
}

export default async function TextMessagePage({ params }: TextMessagePageProps) {
    const { slug } = await params
    const textMessage = await getTextMessageBySlugServer(slug)

    if (!textMessage) {
        notFound()
    }

    return (
        <>
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="font-serif text-3xl md:text-4xl font-bold">{textMessage.title}</h1>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="outline">{textMessage.lang.toUpperCase()}</Badge>
                            {textMessage.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Client-side interactive content */}
                    <TextMessageClientWrapper textMessage={textMessage} />
                </div>
            </main>
            <Footer />
        </>
    )
}
