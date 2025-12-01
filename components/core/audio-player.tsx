"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2 } from "lucide-react"

interface AudioPlayerProps {
    audioUrl: string
    title: string
    onClose?: () => void
}

export function AudioPlayer({ audioUrl, title, onClose }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Initialize audio element
    useEffect(() => {
        if (!audioUrl) return

        const audio = new Audio(audioUrl)
        audioRef.current = audio

        // Update duration when metadata loads
        const handleLoadedMetadata = () => {
            setDuration(audio.duration)
        }

        // Update current time as audio plays
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime)
        }

        // Handle play/pause state
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)
        const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
        }

        // Handle errors
        const handleError = () => {
            console.error('Error playing audio')
            setIsPlaying(false)
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('error', handleError)

        // Set initial volume
        audio.volume = volume

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('error', handleError)
            audio.pause()
            audio.src = ''
        }
    }, [audioUrl])

    // Update volume when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    const handlePlayPause = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play().catch((err) => {
                console.error('Error playing audio:', err)
                setIsPlaying(false)
            })
        }
    }

    const handleSeek = (value: number[]) => {
        if (audioRef.current && duration) {
            const newTime = (value[0] / 100) * duration
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0] / 100)
    }

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds) || !isFinite(seconds)) return "0:00"
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

    if (!audioUrl) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
            {/* Progress bar at the very top */}
            <div className="h-1 bg-muted w-full cursor-pointer" onClick={(e) => {
                if (audioRef.current && duration) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const percent = (e.clientX - rect.left) / rect.width
                    const newTime = percent * duration
                    audioRef.current.currentTime = newTime
                    setCurrentTime(newTime)
                }
            }}>
                <div
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Main player bar */}
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Play/Pause button */}
                    <Button
                        onClick={handlePlayPause}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-primary/10 flex-shrink-0"
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 fill-current" />
                        ) : (
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                        )}
                    </Button>

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{title}</div>
                        <div className="text-xs text-muted-foreground">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    {/* Progress slider - hidden on mobile, shown on tablet+ */}
                    <div className="hidden md:flex flex-1 items-center gap-2 max-w-md">
                        <span className="text-xs text-muted-foreground w-10 text-right flex-shrink-0">
                            {formatTime(currentTime)}
                        </span>
                        <Slider
                            value={[progressPercentage]}
                            onValueChange={handleSeek}
                            max={100}
                            step={0.1}
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-10 flex-shrink-0">
                            {formatTime(duration)}
                        </span>
                    </div>

                    {/* Volume control - hidden on mobile/tablet, shown on desktop */}
                    <div className="hidden lg:flex items-center gap-2 w-32 flex-shrink-0">
                        <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Slider
                            value={[volume * 100]}
                            onValueChange={handleVolumeChange}
                            max={100}
                            step={1}
                            className="flex-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

