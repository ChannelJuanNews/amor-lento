"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiCall } from "./api-client"

interface User {
    id: string
    email?: string
    created_at?: string
    role?: string
}

interface Session {
    access_token: string
    refresh_token: string
    expires_at?: number
}

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signUp: (email: string, password: string) => Promise<{ error: any }>
    signOut: () => Promise<void>
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// User storage helper (only store user info, not tokens - tokens are in httpOnly cookies)
const USER_KEY = 'supabase_user'

function getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
}

function setStoredUser(user: User | null) {
    if (typeof window === 'undefined') return
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
        localStorage.removeItem(USER_KEY)
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    const checkSession = async () => {
        try {
            // Cookies are sent automatically, no need to pass token
            const data = await apiCall<{ user?: User }>('/auth/session')

            if (data && data.user) {
                setUser(data.user)
                setStoredUser(data.user)
                setLoading(false)
            } else {
                // No valid session, clear storage
                setStoredUser(null)
                setUser(null)
                setSession(null)
                setLoading(false)
            }
        } catch (error) {
            // Session invalid, clear storage
            setStoredUser(null)
            setUser(null)
            setSession(null)
            setLoading(false)
        }
    }

    useEffect(() => {
        // Get initial user from storage (tokens are in httpOnly cookies)
        const storedUser = getStoredUser()

        if (storedUser) {
            setUser(storedUser)
            // Verify session is still valid (cookies sent automatically)
            checkSession()
        } else {
            // Still check if we have valid cookies
            checkSession()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signIn = async (email: string, password: string) => {
        try {
            // Cookies are set by the server
            const data = await apiCall<{ user: User }>('/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            })

            setUser(data.user)
            setStoredUser(data.user)
            // Session tokens are in httpOnly cookies, we don't store them client-side
            setSession({ access_token: '', refresh_token: '' }) // Placeholder for type compatibility
            return { error: null }
        } catch (error: any) {
            return { error: { message: error.message || 'Failed to sign in' } }
        }
    }

  const signUp = async (email: string, password: string) => {
    try {
      // Cookies are set by the server if session exists
      const data = await apiCall<{ user: User; requiresEmailConfirmation?: boolean; message?: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (data && data.user) {
        setUser(data.user)
        setStoredUser(data.user)
        // Session tokens are in httpOnly cookies, we don't store them client-side
        setSession({ access_token: '', refresh_token: '' }) // Placeholder for type compatibility
        
        // If email confirmation is required, return early with message
        if (data.requiresEmailConfirmation) {
          return { 
            error: { 
              message: data.message || 'Please check your email to confirm your account before signing in.' 
            } 
          }
        }
        
        // Verify session after signup to ensure we have valid auth
        // This will refresh the user data from the server
        try {
          await checkSession()
        } catch (err) {
          // If checkSession fails, user data is already set from signup response
          console.log('[Auth] Session check after signup:', err)
        }
      }
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to sign up' } }
    }
  }

    const signOut = async () => {
        try {
            // Server will clear cookies
            await apiCall('/auth/signout', {
                method: 'POST',
            })
        } catch (error) {
            // Continue even if API call fails
        }
        setStoredUser(null)
        setUser(null)
        setSession(null)
    }

    const refreshSession = async () => {
        try {
            // Refresh token is in httpOnly cookie, sent automatically
            await apiCall<{ success: boolean }>('/auth/refresh', {
                method: 'POST',
            })

            // Verify session after refresh
            const data = await apiCall<{ user: User }>('/auth/session')
            if (data.user) {
                setUser(data.user)
                setStoredUser(data.user)
                setSession({ access_token: '', refresh_token: '' }) // Placeholder
            }
        } catch (error) {
            // Refresh failed, clear session
            setStoredUser(null)
            setUser(null)
            setSession(null)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signIn,
                signUp,
                signOut,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}

