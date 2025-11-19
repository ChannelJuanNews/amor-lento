// IMPORTANT: Register module aliases FIRST before any other imports
// Use require to ensure this runs synchronously before any imports
require('dotenv/config')
const moduleAlias = require('module-alias')
const path = require('path')
const fs = require('fs')

// Register module aliases for runtime
// Since server.ts compiles to dist/server.js, __dirname will be dist/
// The compiled files are in dist/, so @ should point to dist/ (which is __dirname)
const distDir = typeof __dirname !== 'undefined'
    ? __dirname
    : process.cwd()

// Project root is one level up from dist/
const projectRoot = typeof __dirname !== 'undefined'
    ? path.resolve(__dirname, '..')
    : process.cwd()

// Ensure projectRoot is an absolute path and verify it exists
const absoluteProjectRoot = path.resolve(projectRoot)
if (!fs.existsSync(absoluteProjectRoot)) {
    console.error(`[Server] ERROR: Project root does not exist: ${absoluteProjectRoot}`)
    process.exit(1)
}

// Verify key directories exist
const pagesDir = path.join(absoluteProjectRoot, 'pages')
const nextConfigPath = path.join(absoluteProjectRoot, 'next.config.ts')
if (!fs.existsSync(pagesDir) && !fs.existsSync(path.join(absoluteProjectRoot, 'app'))) {
    console.error(`[Server] ERROR: Neither pages/ nor app/ directory found in ${absoluteProjectRoot}`)
    process.exit(1)
}

// Register the alias - this must happen before any imports using @
// Point @ to the dist directory where compiled files are located
moduleAlias.addAliases({
    '@': distDir
})

// Now we can import modules that use the @ alias
import express, { Request, Response, NextFunction } from "express"
import { createServer } from "http"
import next from "next"
import { parse } from "url"
import apiRouter from "./api"
import supabase from "@/lib/supabase"


// TEMPORARY WORKAROUND for Next.js 15.x bug with custom servers in dev mode
// The dev bundler has a bug where path.relative() is called with undefined
// Options:
// 1. Run in production mode: NODE_ENV=production npm run server
// 2. Use Next.js built-in dev server: npm run dev (but this won't include your Express API routes)
// 3. Wait for Next.js fix or downgrade to Next.js 14.x

// Force production mode if NEXT_PRODUCTION env var is set (workaround for Next.js 15.x bug)
// Otherwise use NODE_ENV to determine dev mode
const forceProduction = process.env.NEXT_PRODUCTION === '1' || process.env.NODE_ENV === 'production'
const dev = forceProduction ? false : (process.env.NODE_ENV !== "production")
const port = process.env.PORT || 4000

if (dev) {
    console.warn(`[Server] WARNING: Running in dev mode with custom server.`)
    console.warn(`[Server] Next.js 15.x has a known bug that may cause path.relative() errors.`)
    console.warn(`[Server] If you encounter errors, try: NODE_ENV=production npm run server`)
}
// Tell Next.js where the project root is (one level up from dist/)
// Use absolute path and ensure it exists
console.log(`[Server] Project root: ${absoluteProjectRoot}`)
console.log(`[Server] Dist dir: ${distDir}`)
console.log(`[Server] Dev mode: ${dev}`)
console.log(`[Server] Working directory: ${process.cwd()}`)

// Workaround for Next.js 15.x dev bundler path resolution issue
// Change working directory to project root BEFORE Next.js init
// This ensures Next.js can resolve all paths correctly using process.cwd()
const originalCwd = process.cwd()
process.chdir(absoluteProjectRoot)

// Ensure .next directory exists (Next.js needs this for dev mode)
const nextDir = path.join(absoluteProjectRoot, '.next')
if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir, { recursive: true })
}

// Set environment variables that Next.js dev bundler might need
// These help Next.js resolve paths correctly
if (!process.env.NEXT_TELEMETRY_DISABLED) {
    process.env.NEXT_TELEMETRY_DISABLED = '1'
}

// CRITICAL: Set explicit paths for Next.js 15.x dev bundler workaround
// The dev bundler has a bug where it calls path.relative() with undefined values
// Setting these environment variables helps Next.js resolve paths correctly
process.env.NEXT_PRIVATE_STANDALONE = 'false'
process.env.NEXT_PRIVATE_DIR = absoluteProjectRoot
process.env.NEXT_PRIVATE_CONF_DIR = absoluteProjectRoot

// Ensure Next.js can find the config file
const configPath = path.join(absoluteProjectRoot, 'next.config.ts')
if (fs.existsSync(configPath)) {
    console.log(`[Server] Found next.config.ts at ${configPath}`)
    // Set the config path explicitly
    process.env.NEXT_PRIVATE_CONFIG_FILE = configPath
}

// WORKAROUND: Patch path.relative to handle undefined values (Next.js 15.x bug)
// This is a temporary fix for the known bug where Next.js dev bundler calls
// path.relative() with undefined arguments, causing crashes
if (dev) {
    const originalRelative = path.relative.bind(path)
    // @ts-ignore - We're intentionally patching to handle Next.js bug
    path.relative = function (from: any, to: any): string {
        // If either argument is undefined, use project root as fallback to prevent crash
        // This allows Next.js to continue initialization even with the bug
        if (from === undefined || from === null) {
            console.warn(`[Server] WARNING: path.relative() called with undefined 'from'. This is a Next.js 15.x bug.`)
            from = absoluteProjectRoot
        }
        if (to === undefined || to === null) {
            console.warn(`[Server] WARNING: path.relative() called with undefined 'to'. This is a Next.js 15.x bug.`)
            to = absoluteProjectRoot
        }
        // Ensure both are strings before calling original
        if (typeof from !== 'string' || typeof to !== 'string') {
            console.warn(`[Server] WARNING: path.relative() called with non-string values: from=${typeof from}, to=${typeof to}`)
            return ''
        }
        return originalRelative(from, to)
    }
    console.log(`[Server] Applied path.relative() workaround for Next.js 15.x bug`)
}

// Workaround for Next.js 15.x bug: The dev bundler has issues with path resolution
// when using custom servers. Try to initialize Next.js with explicit confDir
// If this still fails, it's a known Next.js 15.x bug - consider:
// 1. Using Next.js built-in server (npm run dev) for development
// 2. Running in production mode (NODE_ENV=production)
// 3. Downgrading to Next.js 14.x
// 4. Waiting for Next.js fix

// Initialize Next.js - try with and without dir option
// The error suggests Next.js dev bundler can't resolve paths correctly
// NOTE: There's a known bug in Next.js 15.x where the dev bundler fails with custom servers
// If dev mode fails, try setting NODE_ENV=production or NEXT_PRODUCTION=1
console.log(`[Server] Initializing Next.js in ${dev ? 'development' : 'production'} mode...`)

let app: ReturnType<typeof next>
let handle: ReturnType<typeof app.getRequestHandler>

try {
    // For Next.js 15.x, we need to ensure all paths are absolute and properly set
    // The bug occurs when Next.js tries to resolve relative paths that are undefined
    // Ensure all necessary directories exist before initialization
    const pagesDirPath = path.join(absoluteProjectRoot, 'pages')
    const appDirPath = path.join(absoluteProjectRoot, 'app')

    // Ensure at least one of pages or app directory exists
    if (!fs.existsSync(pagesDirPath) && !fs.existsSync(appDirPath)) {
        throw new Error(`Neither pages/ nor app/ directory found in ${absoluteProjectRoot}`)
    }

    const nextOptions: any = {
        dev,
        dir: absoluteProjectRoot,
    }

    app = next(nextOptions)
    handle = app.getRequestHandler()
} catch (initError: any) {
    console.error(`\x1b[31m[Server] Failed to initialize Next.js:\x1b[0m`, initError)
    if (dev) {
        console.error(`\x1b[31m[Server] This is a known Next.js 15.x bug with custom servers in dev mode.\x1b[0m`)
        console.error(`\x1b[31m[Server] Try running with NODE_ENV=production or set NEXT_PRODUCTION=1\x1b[0m`)
        console.error(`\x1b[31m[Server] Example: NEXT_PRODUCTION=1 npm run server\x1b[0m`)
        console.error(`\x1b[31m[Server] Or use: npm run dev:server:prod\x1b[0m`)
    }
    process.exit(1)
}

app.prepare().then(() => {
    const server = express()

    // Note: www to non-www redirects are handled at the nginx level for better performance
    // See nginx.conf for the redirect configuration

    // Add JSON and URL-encoded body parser middleware
    server.use(express.json())
    server.use(express.urlencoded({ extended: true })) // Required for Apple OAuth POST callbacks
    
    // Add cookie parser middleware
    const cookieParser = require('cookie-parser')
    server.use(cookieParser())


    // Middleware for CORS and logging on /api
    // Handle all /api requests with apiRouter
    server.use("/api", (req: Request, res: Response, next: NextFunction) => {
        // Allow credentials (cookies) - when using credentials, must specify origin (can't use "*")
        const origin = req.headers.origin
        if (origin) {
            res.setHeader("Access-Control-Allow-Origin", origin)
            res.setHeader("Access-Control-Allow-Credentials", "true")
        } else {
            // Fallback for same-origin requests
            res.setHeader("Access-Control-Allow-Origin", "*")
        }
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type")

        if (req.method === "OPTIONS") {
            return res.status(200).end()
        }

        console.log(`[API] ${req.method} ${req.originalUrl}`)
        next()
    }, apiRouter)

    // Let Next.js handle everything else (including /api/og)
    // Important: Pass parsedUrl to ensure Next.js can properly handle static files
    server.use((req, res) => {
        const parsedUrl = parse(req.url || '/', true)
        return handle(req, res, parsedUrl)
    })

    createServer(server).listen(port, async (err?: Error) => {
        if (err) throw err
        console.log("> Custom Next.js server running on http://localhost:4000")

        // Health check: do a lightweight database call (should not require heavy query)
        try {
            const { error } = await supabase.rpc('version'); // calls the custom Postgres function 'public.version'
            if (error) {
                console.error("\x1b[31m[HealthCheck] Supabase connection failed:", error.message || error, "\x1b[0m");
            } else {
                console.log("\x1b[32m[HealthCheck] Supabase database connection OK\x1b[0m");
            }
        } catch (err) {
            console.error("\x1b[31m[HealthCheck] Error connecting to Supabase:", err, "\x1b[0m");
        }

    })
}).catch((err: Error) => {
    console.error("[Server] Failed to prepare Next.js app:", err)
    process.exit(1)
})
