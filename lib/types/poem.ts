export interface Poem {
    id?: string
    slug: string
    title: string
    content: string
    excerpt: string
    lang: "en" | "es"
    tags: string[]
    length?: "short" | "long"
    audioSrc?: string
    publishedAt: string
    published?: boolean
    featured?: boolean
  }
  