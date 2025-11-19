"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/types/product"

interface CartItem extends Product {
    quantity: number
    selectedOptions?: Record<string, string>
}

interface CartContextType {
    items: CartItem[]
    addItem: (product: Product, options?: Record<string, string>) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    total: number
    itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Load cart from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("amor-lento-cart")
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to load cart:", e)
            }
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("amor-lento-cart", JSON.stringify(items))
    }, [items])

    const addItem = (product: Product, options?: Record<string, string>) => {
        setItems((current) => {
            const existing = current.find(
                (item) => item.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(options),
            )

            if (existing) {
                return current.map((item) =>
                    item.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(options)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                )
            }

            return [...current, { ...product, quantity: 1, selectedOptions: options }]
        })
    }

    const removeItem = (productId: string) => {
        setItems((current) => current.filter((item) => item.id !== productId))
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }

        setItems((current) => current.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }

    const clearCart = () => {
        setItems([])
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within CartProvider")
    }
    return context
}
