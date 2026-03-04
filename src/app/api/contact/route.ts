import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

/** Escape HTML special characters to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message)

    // Send notification to admin
    await sgMail.send({
      to: 'support@tynkerlab.ai',
      from: {
        email: 'info@tynkerlab.ai',
        name: 'Tynkerlab.ai Contact Form',
      },
      replyTo: { email, name },
      subject: `[Contact Form] ${safeSubject}: ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br/>')}</p>
      `,
    })

    // Send confirmation to user
    await sgMail.send({
      to: email,
      from: {
        email: 'info@tynkerlab.ai',
        name: 'Tynkerlab.ai',
      },
      subject: 'We received your message - Tynkerlab.ai',
      html: `
        <h2>Thanks for reaching out, ${safeName}!</h2>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <br/>
        <p>Your message:</p>
        <blockquote style="border-left: 3px solid #7c3aed; padding-left: 12px; color: #666;">
          ${safeMessage.replace(/\n/g, '<br/>')}
        </blockquote>
        <br/>
        <p>Best regards,<br/>The Tynkerlab.ai Team</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('SendGrid error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
