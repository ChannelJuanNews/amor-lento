import { Router, Request, Response } from 'express'
import { verifyAuth } from './middleware/auth'
import supabase from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const authRouter = Router()

/**
 * POST /api/auth/signin
 * Sign in with email and password
 */
authRouter.post('/signin', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        // Sign in via Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return res.status(401).json({ error: error.message })
        }

        if (!data.session) {
            return res.status(401).json({ error: 'Failed to create session' })
        }

        // Set httpOnly cookies
        const isProduction = process.env.NODE_ENV === 'production'
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // Only send over HTTPS in production
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
            path: '/',
        }

        res.cookie('access_token', data.session.access_token, cookieOptions)
        res.cookie('refresh_token', data.session.refresh_token, cookieOptions)

        // Get user role
        let role = data.user.user_metadata?.role || 'user'
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (profile?.role) {
                role = profile.role
            }
        } catch (err) {
            // Profiles table might not exist
        }

        res.json({
            user: {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at,
                role,
            },
        })
    } catch (error: any) {
        console.error('[Auth API] Error signing in:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/auth/signup
 * Sign up with email and password
 */
authRouter.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        // Sign up via Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            return res.status(400).json({ error: error.message })
        }

    // If no session was created (email confirmation required), auto-confirm the user
    // This uses the service role to bypass email confirmation for admin signups
    if (!data.session && data.user) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const supabaseUrl = process.env.SUPABASE_URL
      
      if (!serviceRoleKey) {
        console.warn('[Auth API] SUPABASE_SERVICE_ROLE_KEY not set - email confirmation required')
        console.warn('[Auth API] User created but needs to confirm email:', data.user.email)
      } else if (!supabaseUrl) {
        console.error('[Auth API] SUPABASE_URL not set - cannot auto-confirm user')
      } else {
        try {
          const adminClient = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            }
          )

          // Admin API to update user and confirm email
          // Using the correct Supabase admin API format
          const { data: updatedUser, error: adminError } = await adminClient.auth.admin.updateUserById(
            data.user.id,
            { 
              email_confirm: true,
            }
          )

          if (adminError) {
            console.error('[Auth API] Error confirming user email:', adminError.message || adminError)
            console.error('[Auth API] Admin error details:', JSON.stringify(adminError, null, 2))
            // Continue without auto-confirmation - user will need to confirm email
          } else if (updatedUser) {
            // Now sign in the user to create a session
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            if (!signInError && signInData?.session) {
              // Use the session from sign-in
              const isProduction = process.env.NODE_ENV === 'production'
              const cookieOptions = {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax' as const,
                maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
                path: '/',
              }

              res.cookie('access_token', signInData.session.access_token, cookieOptions)
              res.cookie('refresh_token', signInData.session.refresh_token, cookieOptions)

              // Update user reference
              if (signInData.user) {
                data.user = signInData.user
                data.session = signInData.session
              }
            } else if (signInError) {
              console.error('[Auth API] Error signing in after confirmation:', signInError)
            }
          }
        } catch (err: any) {
          console.error('[Auth API] Error in auto-confirmation process:', err)
          console.error('[Auth API] Error stack:', err.stack)
          // Continue without auto-confirmation - signup will succeed but user needs to confirm email
        }
      }
      
      // If we still don't have a session after auto-confirmation attempt,
      // return success but indicate email confirmation is needed
      if (!data.session) {
        return res.status(200).json({
          user: {
            id: data.user?.id,
            email: data.user?.email,
            created_at: data.user?.created_at,
            role: 'user',
          },
          requiresEmailConfirmation: true,
          message: 'Account created! Please check your email to confirm your account before signing in.',
        })
      }
    }

    // Set httpOnly cookies if session exists
        if (data.session) {
            const isProduction = process.env.NODE_ENV === 'production'
            const cookieOptions = {
                httpOnly: true,
                secure: isProduction, // Only send over HTTPS in production
                sameSite: 'lax' as const,
                maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
                path: '/',
            }

            res.cookie('access_token', data.session.access_token, cookieOptions)
            res.cookie('refresh_token', data.session.refresh_token, cookieOptions)
        }

        // Get user role
        let role = 'user'
        if (data.user) {
            role = data.user.user_metadata?.role || 'user'
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                if (profile?.role) {
                    role = profile.role
                }
            } catch (err) {
                // Profiles table might not exist
            }
        }

        res.json({
            user: {
                id: data.user?.id,
                email: data.user?.email,
                created_at: data.user?.created_at,
                role,
            },
        })
    } catch (error: any) {
        console.error('[Auth API] Error signing up:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/auth/signout
 * Sign out (requires auth)
 */
authRouter.post('/signout', verifyAuth, async (req: Request, res: Response) => {
    try {
        // Sign out via Supabase
        await supabase.auth.signOut()

        // Clear cookies
        res.clearCookie('access_token', { path: '/' })
        res.clearCookie('refresh_token', { path: '/' })

        res.json({ success: true })
    } catch (error: any) {
        console.error('[Auth API] Error signing out:', error)
        // Clear cookies even if Supabase signout fails
        res.clearCookie('access_token', { path: '/' })
        res.clearCookie('refresh_token', { path: '/' })
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/auth/session
 * Get current session info (optional auth - returns user if authenticated)
 */
authRouter.get('/session', async (req: Request, res: Response) => {
    try {
        // Use optionalAuth logic inline to avoid middleware issues
        let token = req.cookies?.access_token
        
        if (!token) {
            const authHeader = req.headers.authorization
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7)
            }
        }

        if (!token) {
            // No token - return empty response (not an error)
            return res.status(200).json({ user: null })
        }

        // Verify token with Supabase
        const { createClient } = require('@supabase/supabase-js')
        const supabaseUrl = process.env.SUPABASE_URL || ""
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY || ""
        
        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('[Auth API] Missing Supabase configuration')
            return res.status(200).json({ user: null })
        }
        
        const supabaseWithToken = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        })

        const { data: { user }, error } = await supabaseWithToken.auth.getUser()

        if (error || !user) {
            // Invalid token - return empty response (not an error)
            return res.status(200).json({ user: null })
        }

        // Get user role from user_metadata or profiles table
        let role = user.user_metadata?.role || 'user'
        
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            
            if (profile?.role) {
                role = profile.role
            }
        } catch (err) {
            // Profiles table might not exist, use user_metadata role
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role,
            },
        })
    } catch (error: any) {
        console.error('[Auth API] Error getting session:', error)
        // Return empty user instead of 500 error
        res.status(200).json({ user: null })
    }
})

/**
 * POST /api/auth/refresh
 * Refresh session token (reads refresh_token from cookie or body)
 */
authRouter.post('/refresh', async (req: Request, res: Response) => {
    try {
        // Try to get refresh token from cookie first, then body
        const refresh_token = req.cookies?.refresh_token || req.body.refresh_token

        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token is required' })
        }

        // Refresh session via Supabase
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token,
        })

        if (error) {
            return res.status(401).json({ error: error.message })
        }

        if (!data.session) {
            return res.status(401).json({ error: 'Failed to refresh session' })
        }

        // Update cookies with new tokens
        const isProduction = process.env.NODE_ENV === 'production'
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
            path: '/',
        }

        res.cookie('access_token', data.session.access_token, cookieOptions)
        res.cookie('refresh_token', data.session.refresh_token, cookieOptions)

        res.json({ success: true })
    } catch (error: any) {
        console.error('[Auth API] Error refreshing session:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default authRouter

