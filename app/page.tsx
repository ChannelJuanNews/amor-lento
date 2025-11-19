"use client"

import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { LocaleProvider } from "@/lib/i18n/locale-context"
import { Button } from "@/components/ui/button"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { useLocale } from "@/lib/i18n/locale-context"
import { getTodaysDailyPoem, getThisWeeksLoveLetter } from "@/lib/scheduled-content"
import { DailyPoemCard } from "@/components/content/daily-poem-card"
import { LoveLetterCard } from "@/components/content/love-letter-card"
import { useState, useEffect } from "react"
import type { ScheduledContent } from "@/lib/types/content-schedule"
import Link from "next/link"
import Image from "next/image"

function HomeContent() {
    const { locale } = useLocale()
    const dict = getDictionary(locale)
    const [dailyPoem, setDailyPoem] = useState<ScheduledContent | null>(null)
    const [loveLetter, setLoveLetter] = useState<ScheduledContent | null>(null)

    useEffect(() => {
        async function fetchContent() {
            const [poem, letter] = await Promise.all([
                getTodaysDailyPoem(locale),
                getThisWeeksLoveLetter(locale)
            ])
            setDailyPoem(poem)
            setLoveLetter(letter)
        }
        fetchContent()
    }, [locale])

    return (
        <>
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mx-auto text-center space-y-8">
                            <div className="flex justify-center">
                                <Image
                                    src="/amorlento.png"
                                    alt="Amor Lento"
                                    width={420}
                                    height={420}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <h1 className="font-serif text-5xl md:text-7xl font-bold text-balance leading-tight">
                                {dict.hero.headline}
                            </h1>
                            <p className="text-xl md:text-2xl text-muted-foreground text-pretty">{dict.hero.subheadline}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {/* <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
                                    <Link href="/poems">{dict.hero.ctaPrimary}</Link>
                                </Button> */}
                                {/* <Button size="lg" variant="outline" asChild>
                                    <Link href="/shop">{dict.hero.ctaSecondary}</Link>
                                </Button> */}
                            </div> 
                            {/* <div className="pt-4">
                                <Button variant="link" asChild className="text-secondary">
                                    <Link href="/custom-poem">{dict.hero.ctaTertiary} →</Link>
                                </Button>
                            </div> */}
                        </div>
                    </div>
                </section>

                {/* {dailyPoem && (
                    <section className="py-16 bg-muted/30">
                        <div className="container mx-auto px-4">
                            <div className="max-w-2xl mx-auto">
                                <DailyPoemCard content={dailyPoem} />
                            </div>
                        </div>
                    </section>
                )}

                {loveLetter && (
                    <section className="py-16">
                        <div className="container mx-auto px-4">
                            <div className="max-w-2xl mx-auto">
                                <LoveLetterCard content={loveLetter} />
                            </div>
                        </div>
                    </section>
                )} */}
            </main>
            <Footer />
        </>
    )
}

export default function Home() {
    return (
        <LocaleProvider>
            <HomeContent />
        </LocaleProvider>
    )
}
