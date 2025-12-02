import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { getTextMessagesServer } from "@/lib/text-messages-server"
import { TextMessagesListClient } from "./text-messages-list-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Text Messages | Amor Lento",
    description: "iPhone-style text message conversations. Create and share beautiful message mockups.",
    openGraph: {
        title: "Text Messages | Amor Lento",
        description: "iPhone-style text message conversations",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Text Messages | Amor Lento",
        description: "iPhone-style text message conversations",
    },
}

export default async function TextMessagesPage() {
    // Fetch initial text messages on the server for SEO
    const initialData = await getTextMessagesServer({ page: 1, limit: 10 })

    return (
        <>
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold">Text Messages</h1>
                        <p className="text-muted-foreground text-lg">
                            iPhone-style text message conversations
                        </p>
                    </div>

                    {/* Client-side interactive list */}
                    <TextMessagesListClient
                        initialTextMessages={initialData.textMessages}
                        initialTotal={initialData.pagination.total}
                        initialHasMore={initialData.pagination.hasMore}
                    />
                </div>
            </main>
            <Footer />
        </>
    )
}
