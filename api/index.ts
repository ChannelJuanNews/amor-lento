import { Router } from 'express'
import authRouter from './auth'
import adminRouter from './admin'
import poemsRouter from './poems'
import loveLettersRouter from './love-letters'
import textMessagesRouter from './text-messages'
import subscriptionsRouter from './subscriptions'
import webhooksRouter from './webhooks'
import scheduledContentRouter from './scheduled-content'

const apiRouter = Router()

// Auth routes
apiRouter.use('/auth', authRouter)

// Admin routes (protected)
apiRouter.use('/admin', adminRouter)

// Webhook routes (public, but should verify signatures)
apiRouter.use('/webhooks', webhooksRouter)

// Public routes
apiRouter.use('/poems', poemsRouter)
apiRouter.use('/love-letters', loveLettersRouter)
apiRouter.use('/text-messages', textMessagesRouter)
apiRouter.use('/subscriptions', subscriptionsRouter)
apiRouter.use('/scheduled-content', scheduledContentRouter)

export default apiRouter