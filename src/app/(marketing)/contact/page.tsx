'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, MessageSquare, HelpCircle, Bug } from 'lucide-react'

const CONTACT_OPTIONS = [
  { icon: HelpCircle, title: 'General Inquiry', desc: 'Questions about Tynkerlab.ai, features, or getting started.', email: 'info@tynkerlab.ai' },
  { icon: MessageSquare, title: 'Sales & Enterprise', desc: 'Custom plans, volume pricing, or partnership opportunities.', email: 'info@tynkerlab.ai' },
  { icon: Bug, title: 'Bug Report', desc: 'Found something broken? Let us know so we can fix it.', email: 'support@tynkerlab.ai' },
  { icon: Mail, title: 'Press & Media', desc: 'Media inquiries, press kits, and interview requests.', email: 'info@tynkerlab.ai' },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSending(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Have a question, feedback, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_OPTIONS.map(({ icon: Icon, title, desc, email }) => (
            <div key={title} className="p-5 bg-nyx-surface border border-nyx-border rounded-xl">
              <Icon className="h-6 w-6 text-primary-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <p className="text-xs text-gray-500 mb-3">{desc}</p>
              <a href={`mailto:${email}`} className="text-xs text-primary-400 hover:underline">{email}</a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-2xl mx-auto px-4 pb-24">
        <div className="bg-nyx-surface border border-nyx-border rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Send us a Message</h2>

          {submitted ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-400 mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Message Sent!</h3>
              <p className="text-sm text-gray-400">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Name" name="name" placeholder="Your name" required />
                <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                <select
                  name="subject"
                  className="w-full bg-nyx-surface border border-nyx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a topic</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Sales & Enterprise">Sales & Enterprise</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Press & Media">Press & Media</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  className="w-full bg-nyx-surface border border-nyx-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Tell us what's on your mind..."
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg p-3">{error}</p>
              )}
              <Button type="submit" variant="primary" className="w-full" loading={sending}>
                Send Message
              </Button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
