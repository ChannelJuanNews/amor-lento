export interface Product {
    id: string
    handle: string
    name: string
    description: string
    price: number
    currency: string
    type: "digital" | "physical" | "custom"
    category: "print" | "journal" | "gift" | "ebook" | "custom"
    images: string[]
    variants?: ProductVariant[]
    stripePriceId?: string
    active: boolean
    featured?: boolean
  }
  
  export interface ProductVariant {
    id: string
    name: string
    price: number
    stripePriceId?: string
  }
  
  export interface CartItem {
    product: Product
    variant?: ProductVariant
    quantity: number
  }
  