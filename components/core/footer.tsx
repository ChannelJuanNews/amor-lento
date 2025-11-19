"use client"

import Link from "next/link"
import { useLocale } from "@/lib/i18n/locale-context"
import { getDictionary } from "@/lib/i18n/get-dictionary"

export function Footer() {
    const { locale } = useLocale()
    const dict = getDictionary(locale)

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                {/* Use 1 (mobile) / 2 (sm) / 3 (md+) columns for symmetry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-3 flex flex-col justify-center md:justify-start">
                        <div className="flex items-center gap-2">
                            <img
                                src="/amorlento.png"
                                alt="Amor Lento"
                                width={24}
                                height={24}
                                className="object-contain text-secondary"
                                style={{ borderRadius: 4 }}
                            />
                            <span className="font-serif text-lg font-semibold">Amor Lento</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{dict.footer.tagline}</p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="font-semibold mb-3">Navigation</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/poems" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {dict.nav.poems}
                                </Link>
                            </li>
                            <li>
                                <Link href="/love-letters" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {dict.nav.loveLetters}
                                </Link>
                            </li>
                            <li>
                                <Link href="/newsletter" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {dict.nav.newsletter}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold mb-3">{dict.footer.legal}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {dict.footer.privacy}
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {dict.footer.terms}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Amor Lento. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
