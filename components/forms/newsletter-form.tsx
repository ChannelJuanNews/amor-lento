"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/i18n/locale-context"
import { getDictionary } from "@/lib/i18n/get-dictionary"

export function NewsletterForm() {
  const { locale } = useLocale()
  const dict = getDictionary(locale)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const response = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, locale }),
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to subscribe" }))
        throw new Error(error.error || "Failed to subscribe")
      }

      setStatus("success")
      setEmail("")
      setTimeout(() => setStatus("idle"), 3000)
    } catch (error: any) {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="newsletter-email" className="sr-only">
          Email address
        </Label>
        <Input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={locale === "en" ? "your@email.com" : "tu@email.com"}
          disabled={status === "loading" || status === "success"}
          className="bg-background"
        />
      </div>
      <Button type="submit" className="w-full" disabled={status === "loading" || status === "success"}>
        {status === "loading" && dict.common.loading}
        {status === "success" && dict.common.success}
        {status === "idle" && dict.common.subscribe}
        {status === "error" && "Try Again"}
      </Button>
      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {locale === "en" ? "Welcome to the slow love movement!" : "¡Bienvenido al movimiento del amor lento!"}
        </p>
      )}
    </form>
  )
}
