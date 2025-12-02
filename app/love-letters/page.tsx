import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { getLoveLettersServer } from "@/lib/love-letters-server"
import { LoveLettersClient } from "./love-letters-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Love Letters | Amor Lento",
    description: "Weekly love letters written at a human pace. Intimate letters in English and Spanish.",
    openGraph: {
        title: "Love Letters | Amor Lento",
        description: "Weekly love letters written at a human pace",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Love Letters | Amor Lento",
        description: "Weekly love letters written at a human pace",
    },
}

export default async function LoveLettersPage() {
    // Fetch initial love letters on the server for SEO
    const initialData = await getLoveLettersServer({ page: 1, limit: 10 })

    return (
        <>
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold">Love Letters</h1>
                        <p className="text-muted-foreground text-lg">
                            Weekly love letters written at a human pace
                        </p>
                    </div>

                    {/* Client-side interactive list */}
                    <LoveLettersClient
                        initialLoveLetters={initialData.loveLetters}
                        initialTotal={initialData.pagination.total}
                        initialHasMore={initialData.pagination.hasMore}
                    />
                </div>
            </main>
            <Footer />
        </>
    )
}
