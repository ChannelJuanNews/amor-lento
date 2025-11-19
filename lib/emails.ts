import resend from './resend'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const SITE_URL = process.env.SITE_URL || 'http://localhost:4000'

interface WelcomeEmailOptions {
  email: string
  locale?: 'en' | 'es'
  unsubscribeToken?: string
}

export async function sendWelcomeEmail({ email, locale = 'en', unsubscribeToken }: WelcomeEmailOptions) {
  if (!resend) {
    console.warn('[Email] Resend not configured, skipping welcome email')
    return { success: false, error: 'Email service not configured' }
  }

  const unsubscribeUrl = unsubscribeToken 
    ? `${SITE_URL}/unsubscribe?token=${unsubscribeToken}`
    : `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`

  const content = {
    en: {
      subject: 'Welcome to Amor Lento',
      greeting: 'Welcome to the slow love movement!',
      body: [
        'Thank you for joining Amor Lento—where love moves at a human pace.',
        'We believe love deserves time, attention, and words that last. That\'s why we write poetry that doesn\'t expire, words meant to be kept, shared, and returned to.',
        'You\'ll receive a weekly poem in your inbox. No spam, just poetry crafted with intention.',
        'We\'re honored to have you here.',
      ],
      closing: 'With slow love,',
      signature: 'The Amor Lento Team',
      unsubscribeText: 'If you no longer wish to receive these emails, you can',
      unsubscribeLink: 'unsubscribe here',
    },
    es: {
      subject: 'Bienvenido a Amor Lento',
      greeting: '¡Bienvenido al movimiento del amor lento!',
      body: [
        'Gracias por unirte a Amor Lento—donde el amor se mueve a un ritmo humano.',
        'Creemos que el amor merece tiempo, atención y palabras que perduren. Por eso escribimos poesía que no caduca, palabras destinadas a guardarse, compartirse y volver a ellas.',
        'Recibirás un poema semanal en tu bandeja de entrada. Sin spam, solo poesía creada con intención.',
        'Es un honor tenerte aquí.',
      ],
      closing: 'Con amor lento,',
      signature: 'El Equipo de Amor Lento',
      unsubscribeText: 'Si ya no deseas recibir estos correos, puedes',
      unsubscribeLink: 'cancelar tu suscripción aquí',
    },
  }

  const t = content[locale]

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.subject}</title>
      </head>
      <body style="font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7f0;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="font-family: Georgia, serif; font-size: 32px; color: #9f1239; margin-bottom: 20px; text-align: center;">
            ${t.greeting}
          </h1>
          
          <div style="margin-top: 30px;">
            ${t.body.map(paragraph => `
              <p style="margin-bottom: 16px; font-size: 16px; line-height: 1.8;">
                ${paragraph}
              </p>
            `).join('')}
          </div>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f3e8e8;">
            <p style="margin-bottom: 8px; font-size: 16px;">
              ${t.closing}
            </p>
            <p style="margin-top: 0; font-size: 16px; color: #9f1239; font-weight: 500;">
              ${t.signature}
            </p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3e8e8; text-align: center;">
            <p style="font-size: 12px; color: #666;">
              ${t.unsubscribeText} <a href="${unsubscribeUrl}" style="color: #9f1239; text-decoration: underline;">${t.unsubscribeLink}</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
${t.greeting}

${t.body.join('\n\n')}

${t.closing}
${t.signature}

---
${t.unsubscribeText} ${unsubscribeUrl}
  `.trim()

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: t.subject,
      html,
      text,
    })

    if (error) {
      console.error('[Email] Error sending welcome email:', error)
      return { success: false, error }
    }

    console.log('[Email] Welcome email sent successfully to:', email)
    return { success: true, data }
  } catch (error: any) {
    console.error('[Email] Exception sending welcome email:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

