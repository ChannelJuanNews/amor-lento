"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { IPhoneMockup } from "@/components/text-messages/iphone-mockup"
import { Share2, Download, Check, Copy } from "lucide-react"
import type { TextMessage } from "@/lib/types/text-message"
import html2canvas from "html2canvas"

interface TextMessageClientWrapperProps {
    textMessage: TextMessage
}

export function TextMessageClientWrapper({ textMessage }: TextMessageClientWrapperProps) {
    const [downloading, setDownloading] = useState(false)
    const [copied, setCopied] = useState(false)
    const mockupRef = useRef<HTMLDivElement>(null)

    const handleShare = async () => {
        const url = window.location.href
        const title = textMessage.title
        const text = `Check out this text conversation: ${textMessage.title}`

        // Try native Web Share API first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                })
            } catch (err) {
                // User cancelled or error, try clipboard fallback
                handleCopyLink()
            }
        } else {
            // Desktop: copy to clipboard
            handleCopyLink()
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const handleDownload = async () => {
        if (!mockupRef.current) return

        setDownloading(true)
        try {
            // Capture the iPhone mockup as image using html2canvas
            const canvas = await html2canvas(mockupRef.current, {
                backgroundColor: "#ffffff",
                scale: 2, // Higher quality (2x for retina)
                logging: false,
                useCORS: true, // Allow cross-origin images
                allowTaint: true, // Allow tainted canvas
                windowWidth: mockupRef.current.scrollWidth,
                windowHeight: mockupRef.current.scrollHeight,
            })

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    const filename = `${textMessage.title.toLowerCase().replace(/\s+/g, "-")}-text-message.png`
                    link.href = url
                    link.download = filename
                    link.click()
                    URL.revokeObjectURL(url)
                }
            })
        } catch (err: any) {
            console.error("Failed to download:", err)

            // Provide helpful error message
            const errorMsg = err?.message || "Unknown error"
            if (errorMsg.includes("lab") || errorMsg.includes("color function")) {
                alert(
                    "Screenshot feature encountered a CSS compatibility issue.\n\n" +
                    "Tip: You can use your browser's built-in screenshot tool:\n" +
                    "• Windows: Win + Shift + S\n" +
                    "• Mac: Cmd + Shift + 4\n" +
                    "• Mobile: Volume Down + Power"
                )
            } else {
                alert("Failed to download image. Please try your browser's screenshot feature instead.")
            }
        } finally {
            setDownloading(false)
        }
    }

    return (
        <>
            {/* iPhone Mockup */}
            <div className="flex justify-center" ref={mockupRef} data-mockup-root>
                <IPhoneMockup textMessage={textMessage} />
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
                <Button variant="outline" className="gap-2" onClick={handleShare}>
                    {copied ? (
                        <>
                            <Check className="h-4 w-4" />
                            Link Copied!
                        </>
                    ) : (
                        <>
                            <Share2 className="h-4 w-4" />
                            Share
                        </>
                    )}
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleDownload} disabled={downloading}>
                    <Download className="h-4 w-4" />
                    {downloading ? "Downloading..." : "Download PNG"}
                </Button>
            </div>

            {/* Info */}
            <div className="text-center text-sm text-muted-foreground">
                <p>
                    Conversation with <span className="font-semibold">{textMessage.contactName}</span>
                </p>
                <p className="mt-2">
                    {textMessage.messages.length} {textMessage.messages.length === 1 ? "message" : "messages"}
                </p>
            </div>
        </>
    )
}
