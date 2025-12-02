"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Globe, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/i18n/locale-context"
import { useCart } from "@/lib/cart-context"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { useState } from "react"

type LocaleType = "en" | "es"

function getToggleLangAria(locale: LocaleType) {
    // Manually return the aria-label alt text for language toggle
    if (locale === "en") {
        return "Cambiar a español"
    } else {
        return "Switch to English"
    }
}

function MobileNavSheet({
    open,
    onClose,
    dict,
    locale,
    setLocale,
    itemCount,
}: {
    open: boolean
    onClose: () => void
    dict: any
    locale: LocaleType
    setLocale: (l: LocaleType) => void
    itemCount: number
}) {
    // Simple left-anchored sliding sheet (no external deps)
    return (
        <div
            className={`fixed inset-0 z-50 transition-all ${open ? "visible" : "invisible"} `}
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 transition-opacity bg-black/40 ${open ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />
            {/* Sheet panel */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-background shadow-xl transition-transform duration-300 flex flex-col 
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
                style={{ zIndex: 60 }}
            >
                <div className="flex items-center justify-between px-4 py-4 border-b">
                    <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
                        <Image
                            src="/amorlento.png"
                            alt="Amor Lento"
                            width={32}
                            height={32}
                            className="group-hover:scale-110 transition-transform"
                        />
                        <span className="font-serif text-xl font-semibold">Amor Lento</span>
                    </Link>
                    <Button variant="ghost" size="icon" aria-label="Close menu" onClick={onClose}>
                        <span className="sr-only">Close</span>
                        <svg viewBox="0 0 20 20" fill="none" width={20} height={20}>
                            <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                    </Button>
                </div>
                <nav className="flex flex-col gap-2 px-4 pt-4">
                    <Link
                        href="/poems"
                        className="rounded text-sm py-2 px-2 hover:text-secondary transition-colors"
                        onClick={onClose}
                    >
                        {dict.nav.poems}
                    </Link>
                    <Link
                        href="/love-letters"
                        className="rounded text-sm py-2 px-2 hover:text-secondary transition-colors"
                        onClick={onClose}
                    >
                        {dict.nav.loveLetters}
                    </Link>
                    <Link
                        href="/text-messages"
                        className="rounded text-sm py-2 px-2 hover:text-secondary transition-colors"
                        onClick={onClose}
                    >
                        {dict.nav.textMessages}
                    </Link>
                    {/* <Link
                        href="/shop"
                        className="rounded text-sm py-2 px-2 hover:text-secondary transition-colors"
                        onClick={onClose}
                    >
                        {dict.nav.shop}
                    </Link> */}
                    {/* <Link
                        href="/custom-poem"
                        className="rounded text-sm py-2 px-2 hover:text-secondary transition-colors"
                        onClick={onClose}
                    >
                        {dict.nav.customPoem}
                    </Link> */}
                    <Link
                        href="/about"
                        className="rounded text-sm py-2 px-2 hover:text-secondary transition-colors"
                        onClick={onClose}
                    >
                        {dict.nav.about}
                    </Link>
                </nav>
                <div className="flex items-center gap-3 px-4 pt-4 mt-auto pb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setLocale(locale === "en" ? "es" : "en")
                            onClose()
                        }}
                        aria-label={getToggleLangAria(locale)}
                    >
                        <Globe className="h-5 w-5" />
                    </Button>
                    {/* <Button variant="ghost" size="icon" asChild className="relative">
                        <Link href="/cart" aria-label="Shopping cart" onClick={onClose}>
                            <ShoppingCart className="h-5 w-5" />
                            {itemCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {itemCount}
                                </Badge>
                            )}
                        </Link>
                    </Button> */}
                </div>
            </div>
        </div>
    )
}

export function Navbar() {
    const { locale, setLocale } = useLocale()
    const { itemCount } = useCart()
    const dict = getDictionary(locale)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Safe type-cast as the only values produced by useLocale are "en" | "es"
    const localeValue = locale as LocaleType
    const setLocaleTyped = setLocale as (l: LocaleType) => void

    return (
        <>
            {/* Main Nav Bar (not sticky, no scroll handler) */}
            <nav className="z-40 w-full transition-all duration-300 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image
                                src="/amorlento.png"
                                alt="Amor Lento"
                                width={32}
                                height={32}
                                className="group-hover:scale-110 transition-transform"
                            />
                            <span className="font-serif text-xl font-semibold">Amor Lento</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/poems" className="text-sm hover:text-secondary transition-colors">
                                {dict.nav.poems}
                            </Link>
                            <Link href="/love-letters" className="text-sm hover:text-secondary transition-colors">
                                {dict.nav.loveLetters}
                            </Link>
                            <Link href="/text-messages" className="text-sm hover:text-secondary transition-colors">
                                {dict.nav.textMessages}
                            </Link>
                            {/* <Link href="/shop" className="text-sm hover:text-secondary transition-colors">
                                {dict.nav.shop}
                            </Link> */}
                            {/* <Link href="/custom-poem" className="text-sm hover:text-secondary transition-colors">
                                {dict.nav.customPoem}
                            </Link> */}
                            <Link href="/about" className="text-sm hover:text-secondary transition-colors">
                                {dict.nav.about}
                            </Link>
                        </div>

                        {/* Desktop actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setLocaleTyped(localeValue === "en" ? "es" : "en")}
                                aria-label={getToggleLangAria(localeValue)}
                            >
                                <Globe className="h-5 w-5" />
                            </Button>
                            {/* <Button variant="ghost" size="icon" asChild className="relative">
                                <Link href="/cart" aria-label="Shopping cart">
                                    <ShoppingCart className="h-5 w-5" />
                                    {itemCount > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                            {itemCount}
                                        </Badge>
                                    )}
                                </Link>
                            </Button> */}
                        </div>

                        {/* Hamburger for mobile */}
                        <div className="flex md:hidden items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Open menu"
                                onClick={() => setMobileOpen(true)}
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
            {/* Mobile nav sheet */}
            <MobileNavSheet
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                dict={dict}
                locale={localeValue}
                setLocale={setLocaleTyped}
                itemCount={itemCount}
            />
        </>
    )
}
