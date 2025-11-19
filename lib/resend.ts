import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ""

if (!RESEND_API_KEY) {
  console.warn("Warning: RESEND_API_KEY is not set. Email functionality will be disabled.")
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export default resend

