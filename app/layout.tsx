import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { LocaleProvider } from "@/lib/i18n/locale-context"
import { AuthProvider } from "@/lib/auth-context"

import { Analytics } from "@/lib/analytics"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
})

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-serif",
    display: "swap",
})

export const metadata: Metadata = {
    title: "Amor Lento — where love lingers longer",
    description: "Original poems, custom love letters, and gifts that linger. Love at a human pace.",
    generator: "v0.app",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://amorlento.com"),
    icons: {
        icon: "/amorlento.png",
        apple: "/amorlento.png",
    },
    openGraph: {
        title: "Amor Lento — where love lingers longer",
        description: "Original poems, custom love letters, and gifts that linger.",
        type: "website",
        locale: "en_US",
        alternateLocale: "es_ES",
        images: [
            {
                url: "/amorlento.png",
                width: 512,
                height: 512,
                alt: "Amor Lento",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Amor Lento — where love lingers longer",
        description: "Original poems, custom love letters, and gifts that linger.",
        images: ["/amorlento.png"],
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="font-sans antialiased" suppressHydrationWarning>
                <AuthProvider>
                    <LocaleProvider>
                        <CartProvider> 
                            <main className="min-h-screen">{children}</main>
                        </CartProvider>
                    </LocaleProvider>
                </AuthProvider>
                <Analytics />
            </body>
        </html>
    )
}
