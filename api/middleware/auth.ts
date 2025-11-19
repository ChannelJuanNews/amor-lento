import { Request, Response, NextFunction } from 'express'
import supabase from '@/lib/supabase'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
        role?: string
      }
    }
  }
}

/**
 * Middleware to verify Supabase auth token from cookies or Authorization header
 * Sets req.user if token is valid
 */
export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Try to get token from cookie first, then fall back to Authorization header
    let token = req.cookies?.access_token
    
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7) // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' })
    }

    // Verify token with Supabase by creating a client with the token
    // and checking if we can get user info
    const { createClient } = require('@supabase/supabase-js')
    const supabaseUrl = process.env.SUPABASE_URL || ""
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY || ""
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Auth Middleware] Missing Supabase configuration')
      return res.status(500).json({ error: 'Server configuration error' })
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
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Get user role from user_metadata or profiles table
    let role = user.user_metadata?.role || 'user'
    
    // Try to get role from profiles table if it exists
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

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role,
    }

    next()
  } catch (error) {
    console.error('[Auth Middleware] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Optional auth middleware - doesn't fail if no token, but sets user if valid
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Try to get token from cookie first, then fall back to Authorization header
    let token = req.cookies?.access_token
    
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (token) {
      const { createClient } = require('@supabase/supabase-js')
      const supabaseUrl = process.env.SUPABASE_URL || ""
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY || ""
      
      if (!supabaseUrl || !supabaseAnonKey) {
        // Skip auth if configuration is missing
        return next()
      }
      
      const supabaseWithToken = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })

      const { data: { user } } = await supabaseWithToken.auth.getUser()
      if (user) {
        // Get user role
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
          // Profiles table might not exist
        }

        req.user = {
          id: user.id,
          email: user.email,
          role,
        }
      }
    }
    next()
  } catch (error) {
    // Continue even if auth fails
    next()
  }
}

/**
 * Middleware to verify user has admin role
 * Must be used after verifyAuth
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' })
  }

  next()
}

