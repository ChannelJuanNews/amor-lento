"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TextMessage } from "@/lib/types/text-message"
import { Edit, Trash2, Eye } from "lucide-react"
import { deleteTextMessage } from "@/lib/text-messages"
import { useState } from "react"
import Link from "next/link"

interface TextMessagesListProps {
    textMessages: TextMessage[]
    onEdit: (textMessage: TextMessage) => void
    onDelete: () => void
}

// Helper function to create slug from title
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

export function TextMessagesList({ textMessages, onEdit, onDelete }: TextMessagesListProps) {
    const [deleting, setDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return

        setDeleting(id)
        try {
            await deleteTextMessage(id)
            onDelete()
        } catch (error) {
            console.error("Error deleting text message:", error)
            alert("Failed to delete text message")
        } finally {
            setDeleting(null)
        }
    }

    if (textMessages.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No text messages yet. Create your first one!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {textMessages.map((textMessage) => {
                const slug = createSlug(textMessage.title)
                const messageCount = textMessage.messages.length
                const statusColor = {
                    draft: "bg-gray-500",
                    scheduled: "bg-blue-500",
                    published: "bg-green-500",
                    archived: "bg-orange-500",
                }[textMessage.status] || "bg-gray-500"

                return (
                    <Card key={textMessage.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-lg">{textMessage.title}</h3>
                                        <Badge className={statusColor}>
                                            {textMessage.status}
                                        </Badge>
                                        <Badge variant="outline">{textMessage.lang.toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            {textMessage.contactImage ? (
                                                <img
                                                    src={textMessage.contactImage}
                                                    alt={textMessage.contactName}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                                    {textMessage.contactName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span>{textMessage.contactName}</span>
                                        </div>
                                        <span>•</span>
                                        <span>
                                            {messageCount} {messageCount === 1 ? "message" : "messages"}
                                        </span>
                                        {textMessage.draftMessage && (
                                            <>
                                                <span>•</span>
                                                <span className="text-blue-600">Has draft</span>
                                            </>
                                        )}
                                    </div>
                                    {textMessage.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {textMessage.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <Link href={`/text-messages/${slug}`} target="_blank">
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(textMessage)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(textMessage.id, textMessage.title)}
                                        disabled={deleting === textMessage.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                {textMessage.messages.slice(0, 2).map((msg, idx) => (
                                    <div key={idx} className="truncate">
                                        <span className="font-medium">
                                            {msg.sender === "user" ? "You" : textMessage.contactName}:
                                        </span>{" "}
                                        {msg.text}
                                    </div>
                                ))}
                                {textMessage.messages.length > 2 && (
                                    <div className="text-xs mt-1">
                                        +{textMessage.messages.length - 2} more messages
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
