export interface Message {
  sender: 'user' | 'contact'
  text: string
  timestamp: string // ISO string
}

export interface TextMessage {
  id: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  title: string
  contactName: string
  contactImage?: string
  messages: Message[]
  draftMessage?: string
  lang: 'en' | 'es'
  tags: string[]
  scheduledAt?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  authorNotes?: string
}

export interface CreateTextMessageInput {
  title: string
  contactName: string
  contactImage?: string
  messages: Message[]
  draftMessage?: string
  lang: 'en' | 'es'
  tags?: string[]
  status?: 'draft' | 'scheduled' | 'published'
  scheduledAt?: string
  publishedAt?: string
  authorNotes?: string
}

export interface UpdateTextMessageInput extends Partial<CreateTextMessageInput> {
  id: string
}
