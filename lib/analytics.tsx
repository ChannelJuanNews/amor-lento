"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    _amorLentoAhrefsInitialized?: boolean
  }
}

/**
 * Analytics component injects analytics tracking scripts.
 * Google Analytics (GA4) and Ahrefs site verification meta tag.
 */
export function Analytics() {
  useEffect(() => {
    // ---- Google Analytics (GA4) fixed for G-N20P9PSP2Z ----
    if (
      typeof window !== "undefined" &&
      !document.getElementById("ga-gtag-script")
    ) {
      // Add GA4 gtag.js loader script
      const script1 = document.createElement("script")
      script1.async = true
      script1.src = "https://www.googletagmanager.com/gtag/js?id=G-N20P9PSP2Z"
      script1.id = "ga-gtag-script"
      document.head.appendChild(script1)

      // Add GA4 initialization script
      const script2 = document.createElement("script")
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-N20P9PSP2Z');
      `
      script2.id = "ga-init-script"
      document.head.appendChild(script2)
    }

    // ---- Ahrefs Webmaster Tools ----
    if (
      typeof window !== "undefined" &&
      !window._amorLentoAhrefsInitialized
    ) {
      window._amorLentoAhrefsInitialized = true
      // Replace the token value with your real value if provided by Ahrefs
      const ahrefsToken = process.env.NEXT_PUBLIC_AHREFS_TOKEN || ""
      if (ahrefsToken && !document.getElementById("ahrefs-script")) {
        const meta = document.createElement("meta")
        meta.name = "ahrefs-site-verification"
        meta.content = ahrefsToken
        meta.id = "ahrefs-script"
        document.head.appendChild(meta)
      }
    }

    // ---- Add additional analytics integrations here ----
    // Example: Facebook Pixel, Hotjar, etc.
  }, [])

  return null
}
