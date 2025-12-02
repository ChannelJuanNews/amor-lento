"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AudioPlayer } from "@/components/core/audio-player"

interface PoemClientWrapperProps {
    audioUrl?: string
    title?: string
}

export function PoemClientWrapper({ audioUrl, title }: PoemClientWrapperProps) {
    const router = useRouter()

    // If audioUrl and title are provided, render AudioPlayer
    if (audioUrl && title) {
        return <AudioPlayer audioUrl={audioUrl} title={title} />
    }

    // Otherwise, render the back button
    return (
        <Button variant="ghost" onClick={() => router.push("/poems")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Poems
        </Button>
    )
}
