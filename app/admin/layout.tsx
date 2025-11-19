"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    // Allow access to login and signup pages without authentication
    const isAuthPage = pathname === "/admin/login" || pathname === "/admin/signup"

    useEffect(() => {
        // Skip auth check on login/signup pages
        if (isAuthPage) {
            return
        }

        if (!loading) {
            if (!user) {
                router.push("/admin/login")
            } else if (user.role !== 'admin') {
                // User is logged in but not an admin - redirect to home
                router.push("/")
            }
        }
    }, [user, loading, router, isAuthPage])

    // Show loading state while checking auth (but not on auth pages)
    if (loading && !isAuthPage) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    // Allow auth pages to render without checking user
    if (isAuthPage) {
        return <>{children}</>
    }

    // Don't render children if user is not admin (will redirect)
    if (!user || user.role !== 'admin') {
        return null
    }

    return <>{children}</>
}

