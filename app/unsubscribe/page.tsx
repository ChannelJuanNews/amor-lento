"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { LocaleProvider } from "@/lib/i18n/locale-context"
import { useLocale } from "@/lib/i18n/locale-context"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Heart } from "lucide-react"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const { locale } = useLocale()
  const dict = getDictionary(locale)
  const token = searchParams.get("token")
  const emailParam = searchParams.get("email")

  const [email, setEmail] = useState(emailParam || "")
  const [status, setStatus] = useState<"idle" | "loading" | "checking" | "success" | "error">(token ? "checking" : "idle")
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    email: string
    subscribed: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check subscription status if token is provided
  useEffect(() => {
    if (token) {
      checkStatus()
    }
  }, [token])

  const checkStatus = async () => {
    if (!token) return

    setStatus("checking")
    try {
      const response = await fetch(`/api/subscriptions/status?token=${token}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Invalid unsubscribe link")
      }

      const data = await response.json()
      setSubscriptionStatus(data)
      setEmail(data.email)
      setStatus("idle")
    } catch (err: any) {
      setError(err.message || "Invalid unsubscribe link")
      setStatus("error")
    }
  }

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setError(null)

    try {
      const body: any = {}
      if (token) {
        body.token = token
      } else if (email) {
        body.email = email
      } else {
        throw new Error("Email is required")
      }

      const response = await fetch("/api/subscriptions/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to unsubscribe" }))
        throw new Error(errorData.error || "Failed to unsubscribe")
      }

      const data = await response.json()
      setStatus("success")
      setSubscriptionStatus((prev) => prev ? { ...prev, subscribed: false } : null)
    } catch (err: any) {
      setError(err.message || "Failed to unsubscribe")
      setStatus("error")
    }
  }

  const content = {
    en: {
      title: "Unsubscribe",
      description: "We're sorry to see you go",
      emailLabel: "Email address",
      emailPlaceholder: "your@email.com",
      unsubscribeButton: "Unsubscribe",
      success: "You have been unsubscribed",
      alreadyUnsubscribed: "This email is already unsubscribed",
      error: "Something went wrong",
    },
    es: {
      title: "Cancelar Suscripción",
      description: "Lamentamos verte partir",
      emailLabel: "Dirección de correo",
      emailPlaceholder: "tu@email.com",
      unsubscribeButton: "Cancelar Suscripción",
      success: "Has cancelado tu suscripción",
      alreadyUnsubscribed: "Este correo ya está cancelado",
      error: "Algo salió mal",
    },
  }

  const t = content[locale]

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-secondary" />
            </div>
            <CardTitle className="font-serif text-2xl">{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "checking" && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Checking subscription...</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center py-8 space-y-4">
                <p className="text-green-600 font-medium">{t.success}</p>
                <p className="text-sm text-muted-foreground">
                  {locale === "en"
                    ? "You will no longer receive our weekly poems."
                    : "Ya no recibirás nuestros poemas semanales."}
                </p>
              </div>
            )}

            {subscriptionStatus && !subscriptionStatus.subscribed && status !== "success" && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t.alreadyUnsubscribed}</p>
              </div>
            )}

            {status !== "checking" && status !== "success" && subscriptionStatus?.subscribed !== false && (
              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div>
                  <label htmlFor="unsubscribe-email" className="block text-sm font-medium mb-2">
                    {t.emailLabel}
                  </label>
                  <Input
                    id="unsubscribe-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required={!token}
                    disabled={!!token || status === "loading"}
                    className="bg-background"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={status === "loading"}>
                  {status === "loading" ? dict.common.loading : t.unsubscribeButton}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}

export default function UnsubscribePage() {
  return (
    <LocaleProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }>
        <UnsubscribeContent />
      </Suspense>
    </LocaleProvider>
  )
}

