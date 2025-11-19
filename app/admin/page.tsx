"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ContentCalendar } from "@/components/admin/content-calendar"
import { ContentEditor } from "@/components/admin/content-editor"
import { ContentList } from "@/components/admin/content-list"
import { ScheduledContent } from "@/lib/types/content-schedule"
import { apiCall } from "@/lib/api-client"
import { Shield, Heart, Sparkles, Plus, CalendarIcon, FileText, LogOut, Mail, Loader2 } from 'lucide-react'

interface AdminStats {
    pendingSecrets: number
    pendingRequests: number
    scheduledCount: number
    totalCount: number
}

export default function AdminPage() {
    const { user, signOut } = useAuth()
    const router = useRouter()

    const [stats, setStats] = useState<AdminStats>({
        pendingSecrets: 0,
        pendingRequests: 0,
        scheduledCount: 0,
        totalCount: 0,
    })
    const [content, setContent] = useState<ScheduledContent[]>([])
    const [loading, setLoading] = useState(true)
    const [editingContent, setEditingContent] = useState<ScheduledContent | null>(null)
    const [activeTab, setActiveTab] = useState("calendar")

    // Layout handles auth/role checks, but we keep user check here for safety
    if (!user) {
        return null
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [statsData, contentData] = await Promise.all([
                apiCall<AdminStats>("/admin/stats"),
                apiCall<{ content: ScheduledContent[] }>("/admin/content"),
            ])
            setStats(statsData)
            setContent(contentData.content || [])
        } catch (error: any) {
            console.error("Error fetching admin data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleContentSave = (savedContent: ScheduledContent) => {
        // Update content list
        const index = content.findIndex((c) => c.id === savedContent.id)
        if (index >= 0) {
            setContent([...content.slice(0, index), savedContent, ...content.slice(index + 1)])
        } else {
            setContent([savedContent, ...content])
        }
        setEditingContent(null)
        setActiveTab("content")
        fetchData() // Refresh to get updated stats
    }

    const handleContentEdit = (item: ScheduledContent) => {
        setEditingContent(item)
        setActiveTab("editor")
    }

    const handleContentDelete = () => {
        fetchData() // Refresh after delete
    }

    const handleNewContent = () => {
        setEditingContent(null)
        setActiveTab("editor")
    }

    const handleCalendarDateClick = (date: Date) => {
        // Could open editor for that date, or show a modal
        handleNewContent()
    }

    const handleCalendarContentClick = (item: ScheduledContent) => {
        handleContentEdit(item)
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-secondary" />
                    <h1 className="font-serif text-4xl font-bold">Admin Panel</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/webhooks">
                            <Mail className="h-4 w-4 mr-2" />
                            Webhooks
                        </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <Button variant="outline" size="sm" onClick={async () => {
                        await signOut()
                        router.push("/admin/login")
                    }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Secrets</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.pendingSecrets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.pendingRequests}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled Content</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.scheduledCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.totalCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calendar">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Calendar
                    </TabsTrigger>
                    <TabsTrigger value="content">
                        <FileText className="h-4 w-4 mr-2" />
                        All Content
                    </TabsTrigger>
                    <TabsTrigger value="editor">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingContent ? "Edit Content" : "New Content"}
                    </TabsTrigger>
                    <TabsTrigger value="secrets" className="relative">
                        Secrets
                        {stats.pendingSecrets > 0 && (
                            <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">{stats.pendingSecrets}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="relative">
                        Requests
                        {stats.pendingRequests > 0 && (
                            <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">{stats.pendingRequests}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : (
                        <ContentCalendar
                            content={content}
                            onDateClick={handleCalendarDateClick}
                            onContentClick={handleCalendarContentClick}
                        />
                    )}
                </TabsContent>

                <TabsContent value="content">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : (
                        <ContentList
                            content={content}
                            onEdit={handleContentEdit}
                            onDelete={handleContentDelete}
                            onRefresh={fetchData}
                        />
                    )}
                </TabsContent>

                <TabsContent value="editor">
                    <ContentEditor
                        content={editingContent}
                        onSave={handleContentSave}
                        onCancel={() => {
                            setEditingContent(null)
                            setActiveTab("content")
                        }}
                    />
                </TabsContent>

                <TabsContent value="secrets">
                    <div className="p-8 text-center text-muted-foreground">
                        Secrets moderation feature coming soon.
                    </div>
                </TabsContent>

                <TabsContent value="requests">
                    <div className="p-8 text-center text-muted-foreground">
                        Custom poem requests moderation coming soon.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
