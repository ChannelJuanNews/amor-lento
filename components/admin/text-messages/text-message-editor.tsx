"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { IPhoneMockup } from "@/components/text-messages/iphone-mockup"
import { createTextMessage, updateTextMessage } from "@/lib/text-messages"
import type { TextMessage, Message } from "@/lib/types/text-message"
import { Plus, X, User, MessageSquare, Save, Loader2, ArrowUp, ArrowDown } from "lucide-react"

interface TextMessageEditorProps {
    textMessage?: TextMessage | null
    onSave: (textMessage: TextMessage) => void
    onCancel: () => void
}

export function TextMessageEditor({ textMessage, onSave, onCancel }: TextMessageEditorProps) {
    const isEditing = !!textMessage

    // Form state
    const [title, setTitle] = useState(textMessage?.title || "")
    const [contactName, setContactName] = useState(textMessage?.contactName || "")
    const [contactImage, setContactImage] = useState(textMessage?.contactImage || "")
    const [messages, setMessages] = useState<Message[]>(
        textMessage?.messages || []
    )
    const [draftMessage, setDraftMessage] = useState(textMessage?.draftMessage || "")
    const [lang, setLang] = useState<"en" | "es">(textMessage?.lang || "en")
    const [tags, setTags] = useState(textMessage?.tags?.join(", ") || "")
    const [status, setStatus] = useState<"draft" | "published">(
        textMessage?.status === "published" ? "published" : "draft"
    )

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // New message input
    const [newMessageText, setNewMessageText] = useState("")
    const [newMessageSender, setNewMessageSender] = useState<"user" | "contact">("user")

    const handleAddMessage = () => {
        if (!newMessageText.trim()) return

        if (newMessageText.length > 150) {
            setError("Message cannot exceed 150 characters")
            return
        }

        const newMessage: Message = {
            sender: newMessageSender,
            text: newMessageText.trim(),
            timestamp: new Date().toISOString(),
        }

        setMessages([...messages, newMessage])
        setNewMessageText("")
        setError(null)
    }

    const handleRemoveMessage = (index: number) => {
        setMessages(messages.filter((_, i) => i !== index))
    }

    const handleMoveMessage = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return
        if (direction === "down" && index === messages.length - 1) return

        const newMessages = [...messages]
        const targetIndex = direction === "up" ? index - 1 : index + 1
        ;[newMessages[index], newMessages[targetIndex]] = [newMessages[targetIndex], newMessages[index]]
        setMessages(newMessages)
    }

    const handleSave = async () => {
        // Validation
        if (!title.trim()) {
            setError("Title is required")
            return
        }
        if (!contactName.trim()) {
            setError("Contact name is required")
            return
        }
        if (messages.length === 0) {
            setError("At least one message is required")
            return
        }
        if (draftMessage && draftMessage.length > 150) {
            setError("Draft message cannot exceed 150 characters")
            return
        }

        setSaving(true)
        setError(null)

        try {
            const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean)

            const input: any = {
                title: title.trim(),
                contactName: contactName.trim(),
                contactImage: contactImage.trim() || undefined,
                messages,
                draftMessage: draftMessage.trim() || undefined,
                lang,
                tags: tagsArray,
                status,
                publishedAt: status === "published" ? new Date().toISOString() : undefined,
            }

            let result
            if (isEditing && textMessage) {
                result = await updateTextMessage({ id: textMessage.id, ...input })
            } else {
                result = await createTextMessage(input)
            }

            onSave(result.textMessage)
        } catch (err: any) {
            setError(err.message || "Failed to save text message")
        } finally {
            setSaving(false)
        }
    }

    // Preview data
    const previewData: TextMessage = {
        id: textMessage?.id || "preview",
        status: status,
        title: title || "Untitled",
        contactName: contactName || "Contact",
        contactImage: contactImage || undefined,
        messages,
        draftMessage: draftMessage || undefined,
        lang,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Form */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? "Edit Text Message" : "New Text Message"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title (for admin purposes)</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Morning Coffee"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactName">Contact Name</Label>
                                <Input
                                    id="contactName"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    placeholder="Sarah"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactImage">Contact Image URL</Label>
                                <Input
                                    id="contactImage"
                                    value={contactImage}
                                    onChange={(e) => setContactImage(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Language & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lang">Language</Label>
                                <select
                                    id="lang"
                                    value={lang}
                                    onChange={(e) => setLang(e.target.value as "en" | "es")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="sweet, morning, romantic"
                            />
                        </div>

                        {/* Draft Message */}
                        <div className="space-y-2">
                            <Label htmlFor="draftMessage">
                                Draft Message (in keyboard, not sent yet)
                                <span className="text-sm text-muted-foreground ml-2">
                                    {draftMessage.length}/150
                                </span>
                            </Label>
                            <Textarea
                                id="draftMessage"
                                value={draftMessage}
                                onChange={(e) => setDraftMessage(e.target.value)}
                                placeholder="Type a message..."
                                rows={2}
                                maxLength={150}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Messages */}
                <Card>
                    <CardHeader>
                        <CardTitle>Messages</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Message List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border ${
                                        msg.sender === "user"
                                            ? "bg-blue-50 border-blue-200"
                                            : "bg-gray-50 border-gray-200"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={msg.sender === "user" ? "default" : "secondary"}>
                                                    {msg.sender === "user" ? <User className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {msg.sender === "user" ? "You" : contactName || "Contact"}
                                                </span>
                                            </div>
                                            <p className="text-sm">{msg.text}</p>
                                            <span className="text-xs text-muted-foreground">
                                                {msg.text.length}/150 characters
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMoveMessage(index, "up")}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMoveMessage(index, "down")}
                                                disabled={index === messages.length - 1}
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveMessage(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Message */}
                        <div className="space-y-2">
                            <Label>Add Message</Label>
                            <div className="flex gap-2">
                                <select
                                    value={newMessageSender}
                                    onChange={(e) => setNewMessageSender(e.target.value as "user" | "contact")}
                                    className="h-10 px-3 rounded-md border border-input bg-background"
                                >
                                    <option value="user">You</option>
                                    <option value="contact">Contact</option>
                                </select>
                                <Input
                                    value={newMessageText}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessageText(e.target.value)}
                                    placeholder="Message text (max 150 chars)"
                                    maxLength={150}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleAddMessage()
                                        }
                                    }}
                                />
                                <Button onClick={handleAddMessage} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {newMessageText.length}/150 characters • Press Enter to add
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isEditing ? "Update" : "Create"}
                            </>
                        )}
                    </Button>
                    <Button onClick={onCancel} variant="outline">
                        Cancel
                    </Button>
                </div>
            </div>

            {/* Live Preview */}
            <div className="lg:sticky lg:top-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {messages.length > 0 ? (
                            <IPhoneMockup textMessage={previewData} />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Add messages to see preview</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
