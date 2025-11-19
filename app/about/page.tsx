"use client"

import { useLocale } from "@/lib/i18n/locale-context"
import { Button } from "@/components/ui/button"
import { NewsletterForm } from "@/components/forms/newsletter-form"
import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import Link from "next/link"
import { Heart, Feather, Globe, Sparkles } from "lucide-react"

export default function AboutPage() {
    const { locale } = useLocale()

    const content = {
        en: {
            hero: {
                title: "Amor Lento",
                subtitle: "Love at a human pace",
                description:
                    "In a world that rushes, we choose to linger. We believe love deserves time, attention, and words that last.",
            },
            philosophy: {
                title: "Our Philosophy",
                subtitle: "Slow love in a fast world",
                points: [
                    {
                        icon: Heart,
                        title: "Intentional",
                        description: "Every word is chosen with care. Every poem is crafted to be felt, not just read.",
                    },
                    {
                        icon: Feather,
                        title: "Handcrafted",
                        description: "No templates, no AI shortcuts. Just human emotion translated into verse.",
                    },
                    {
                        icon: Globe,
                        title: "Bilingual",
                        description: "Love speaks many languages. We write in English and Spanish, honoring both traditions.",
                    },
                    {
                        icon: Sparkles,
                        title: "Timeless",
                        description: "Poetry that doesn't expire. Words meant to be kept, shared, and returned to.",
                    },
                ],
            },
            story: {
                title: "The Story",
                paragraphs: [
                    "Amor Lento began with a simple question: What if we slowed down?",
                    "In an age of instant messages and fleeting connections, we wanted to create something that lasted. Poetry became our medium—a way to capture the quiet moments, the unspoken feelings, the love that deserves more than a text message.",
                    "We write for the romantics, the dreamers, the ones who still believe in handwritten letters and long conversations. For those who know that the best things in life can't be rushed.",
                ],
            },
            offerings: {
                title: "What We Offer",
                items: [
                    {
                        title: "Original Poetry",
                        description: "Explore our collection of bilingual poems about love, longing, and connection.",
                        cta: "Read Poems",
                        href: "/poems",
                    },
                    {
                        title: "Original Love Letters",
                        description: "Experience our heartfelt, uniquely crafted love letters written for the community.",
                        cta: "Read Love Letters",
                        href: "/love-letters",
                    },
                    // {
                    //     title: "Custom Love Letters",
                    //     description: "Commission a personalized poem for someone special. Delivered as a keepsake.",
                    //     cta: "Commission a Poem",
                    //     href: "/custom-poem",
                    // },
                    // {
                    //     title: "Curated Gifts",
                    //     description: "Poetry prints, journals, and gifts designed for slow love.",
                    //     cta: "Shop Gifts",
                    //     href: "/shop",
                    // },
                ],
            },
            cta: {
                title: "Join the Slow Love Movement",
                description: "Get a weekly poem in your inbox. No spam, just poetry.",
            },
        },
        es: {
            hero: {
                title: "Amor Lento",
                subtitle: "Amor a un ritmo humano",
                description:
                    "En un mundo que corre, elegimos demorarnos. Creemos que el amor merece tiempo, atención y palabras que perduren.",
            },
            philosophy: {
                title: "Nuestra Filosofía",
                subtitle: "Amor lento en un mundo rápido",
                points: [
                    {
                        icon: Heart,
                        title: "Intencional",
                        description: "Cada palabra se elige con cuidado. Cada poema se crea para ser sentido, no solo leído.",
                    },
                    {
                        icon: Feather,
                        title: "Hecho a Mano",
                        description: "Sin plantillas, sin atajos de IA. Solo emoción humana traducida en verso.",
                    },
                    {
                        icon: Globe,
                        title: "Bilingüe",
                        description: "El amor habla muchos idiomas. Escribimos en inglés y español, honrando ambas tradiciones.",
                    },
                    {
                        icon: Sparkles,
                        title: "Atemporal",
                        description: "Poesía que no caduca. Palabras destinadas a guardarse, compartirse y volver a ellas.",
                    },
                ],
            },
            story: {
                title: "La Historia",
                paragraphs: [
                    "Amor Lento comenzó con una pregunta simple: ¿Y si nos tomáramos nuestro tiempo?",
                    "En una era de mensajes instantáneos y conexiones fugaces, queríamos crear algo que perdurara. La poesía se convirtió en nuestro medio—una forma de capturar los momentos tranquilos, los sentimientos no expresados, el amor que merece más que un mensaje de texto.",
                    "Escribimos para los románticos, los soñadores, los que todavía creen en las cartas escritas a mano y las conversaciones largas. Para aquellos que saben que las mejores cosas de la vida no se pueden apresurar.",
                ],
            },
            offerings: {
                title: "Lo Que Ofrecemos",
                items: [
                    {
                        title: "Poesía Original",
                        description: "Explora nuestra colección de poemas bilingües sobre amor, anhelo y conexión.",
                        cta: "Leer Poemas",
                        href: "/poems",
                    },
                    {
                        title: "Cartas de Amor Originales",
                        description: "Descubre nuestras cartas de amor auténticas, creadas especialmente para la comunidad.",
                        cta: "Leer Cartas de Amor",
                        href: "/love-letters",
                    },
                    // {
                    //     title: "Cartas de Amor Personalizadas",
                    //     description: "Encarga un poema personalizado para alguien especial. Entregado como recuerdo.",
                    //     cta: "Encargar un Poema",
                    //     href: "/custom-poem",
                    // },
                    // {
                    //     title: "Regalos Seleccionados",
                    //     description: "Impresiones de poesía, diarios y regalos diseñados para el amor lento.",
                    //     cta: "Ver Regalos",
                    //     href: "/shop",
                    // },
                ],
            },
            cta: {
                title: "Únete al Movimiento del Amor Lento",
                description: "Recibe un poema semanal en tu bandeja de entrada. Sin spam, solo poesía.",
            },
        },
    }

    const t = content[locale]

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-background py-20 md:py-32">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl text-center">
                            <h1 className="font-serif text-5xl font-bold text-balance text-rose-900 md:text-7xl">{t.hero.title}</h1>
                            <p className="mt-4 text-xl text-rose-700 md:text-2xl">{t.hero.subtitle}</p>
                            <p className="mt-6 text-lg text-pretty text-muted-foreground leading-relaxed">{t.hero.description}</p>
                        </div>
                    </div>
                </section>

                {/* Philosophy Section */}
                <section className="py-20 md:py-32">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-6xl">
                            <div className="text-center mb-16">
                                <h2 className="font-serif text-4xl font-bold text-balance text-foreground md:text-5xl">
                                    {t.philosophy.title}
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">{t.philosophy.subtitle}</p>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {t.philosophy.points.map((point, index) => {
                                    const Icon = point.icon
                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center text-center p-6 rounded-lg bg-rose-50/50 border border-rose-100"
                                        >
                                            <div className="mb-4 rounded-full bg-rose-100 p-3">
                                                <Icon className="h-6 w-6 text-rose-600" />
                                            </div>
                                            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{point.title}</h3>
                                            <p className="text-sm text-pretty text-muted-foreground leading-relaxed">{point.description}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-20 md:py-32 bg-rose-50/30">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl">
                            <h2 className="font-serif text-4xl font-bold text-balance text-foreground md:text-5xl mb-8">
                                {t.story.title}
                            </h2>
                            <div className="space-y-6">
                                {t.story.paragraphs.map((paragraph, index) => (
                                    <p key={index} className="text-lg text-pretty text-muted-foreground leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Offerings Section */}
                <section className="py-20 md:py-32">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-6xl">
                            <h2 className="font-serif text-4xl font-bold text-balance text-center text-foreground md:text-5xl mb-16">
                                {t.offerings.title}
                            </h2>

                            <div className="flex flex-wrap justify-center gap-8">
                                {t.offerings.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col p-8 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow w-full max-w-sm"
                                    >
                                        <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">{item.title}</h3>
                                        <p className="text-pretty text-muted-foreground leading-relaxed mb-6 flex-grow">{item.description}</p>
                                        <Button asChild variant="outline" className="w-full bg-transparent">
                                            <Link href={item.href}>{item.cta}</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 md:py-32 bg-gradient-to-b from-rose-50 to-rose-100">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="font-serif text-4xl font-bold text-balance text-rose-900 md:text-5xl mb-4">{t.cta.title}</h2>
                            <p className="text-lg text-rose-700 mb-8">{t.cta.description}</p>
                            <div className="max-w-md mx-auto">
                                <NewsletterForm />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
