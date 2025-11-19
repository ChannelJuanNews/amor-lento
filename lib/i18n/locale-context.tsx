"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Locale } from "./dictionaries"

interface LocaleContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({
    children,
    initialLocale = "en"
}: {
    children: ReactNode
    initialLocale?: Locale
}) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale)

    useEffect(() => {
        const stored = document.cookie.match(/locale=([^;]+)/)?.[1] as Locale
        if (stored && (stored === "en" || stored === "es")) {
            setLocaleState(stored)
        }
    }, [])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
    }

    return (
        <LocaleContext.Provider value={{ locale, setLocale }}>
            {children}
        </LocaleContext.Provider>
    )
}

export function useLocale() {
    const context = useContext(LocaleContext)
    if (!context) {
        throw new Error("useLocale must be used within LocaleProvider")
    }
    return context
}
