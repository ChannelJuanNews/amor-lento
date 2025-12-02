"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TextMessageEditor } from "@/components/admin/text-messages/text-message-editor"
import { TextMessagesList } from "@/components/admin/text-messages/text-messages-list"
import type { TextMessage } from "@/lib/types/text-message"
import { getTextMessages } from "@/lib/text-messages"
import { MessageSquare, Plus, List, ArrowLeft, Loader2 } from 'lucide-react'

export default function AdminTextMessagesPage() {
    const { user } = useAuth()

    const [textMessages, setTextMessages] = useState<TextMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [editingTextMessage, setEditingTextMessage] = useState<TextMessage | null>(null)
    const [activeTab, setActiveTab] = useState("list")

    // Layout handles auth/role checks, but we keep user check here for safety
    if (!user) {
        return null
    }

    useEffect(() => {
        fetchTextMessages()
    }, [])

    const fetchTextMessages = async () => {
        try {
            setLoading(true)
            // Fetch all text messages (no pagination limit for admin)
            const response = await getTextMessages({ page: 1, limit: 100 })
            setTextMessages(response.textMessages || [])
        } catch (error: any) {
            console.error("Error fetching text messages:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleTextMessageSave = (savedTextMessage: TextMessage) => {
        // Update text messages list
        const index = textMessages.findIndex((tm) => tm.id === savedTextMessage.id)
        if (index >= 0) {
            setTextMessages([...textMessages.slice(0, index), savedTextMessage, ...textMessages.slice(index + 1)])
        } else {
            setTextMessages([savedTextMessage, ...textMessages])
        }
        setEditingTextMessage(null)
        setActiveTab("list")
        fetchTextMessages() // Refresh to ensure we have latest data
    }

    const handleTextMessageEdit = (textMessage: TextMessage) => {
        setEditingTextMessage(textMessage)
        setActiveTab("editor")
    }

    const handleTextMessageDelete = () => {
        fetchTextMessages() // Refresh after delete
    }

    const handleNewTextMessage = () => {
        setEditingTextMessage(null)
        setActiveTab("editor")
    }

    // Calculate stats
    const publishedCount = textMessages.filter(tm => tm.status === 'published').length
    const draftCount = textMessages.filter(tm => tm.status === 'draft').length

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-secondary" />
                        <h1 className="font-serif text-4xl font-bold">Text Messages</h1>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Admin
                        </Link>
                    </Button>
                </div>
                <p className="text-muted-foreground">
                    Create and manage iPhone-style text message conversations
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : textMessages.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : publishedCount}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : draftCount}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">
                        <List className="h-4 w-4 mr-2" />
                        All Text Messages
                    </TabsTrigger>
                    <TabsTrigger value="editor">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingTextMessage ? "Edit" : "New"}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-muted-foreground">
                                    {textMessages.length} {textMessages.length === 1 ? "conversation" : "conversations"}
                                </p>
                                <Button onClick={handleNewTextMessage}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Text Message
                                </Button>
                            </div>
                            <TextMessagesList
                                textMessages={textMessages}
                                onEdit={handleTextMessageEdit}
                                onDelete={handleTextMessageDelete}
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="editor">
                    <TextMessageEditor
                        textMessage={editingTextMessage}
                        onSave={handleTextMessageSave}
                        onCancel={() => {
                            setEditingTextMessage(null)
                            setActiveTab("list")
                        }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
