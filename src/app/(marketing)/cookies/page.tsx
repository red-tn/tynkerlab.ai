import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Cookie Policy | Tynkerlab.ai',
  description: 'How Tynkerlab.ai uses cookies and similar technologies.',
}

const COOKIE_TABLE = [
  { name: 'session', purpose: 'Maintains your login session and authentication state.', type: 'Essential', duration: '30 days' },
  { name: 'theme', purpose: 'Stores your preferred color theme (dark/light).', type: 'Functional', duration: '1 year' },
  { name: 'locale', purpose: 'Remembers your preferred language setting.', type: 'Functional', duration: '1 year' },
  { name: 'csrf_token', purpose: 'Prevents cross-site request forgery attacks.', type: 'Essential', duration: 'Session' },
  { name: 'analytics_session', purpose: 'Anonymous session identifier for usage analytics.', type: 'Analytics', duration: '24 hours' },
]

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: February 26, 2026</p>

        <div className="space-y-8">
          <Section title="What Are Cookies?">
            Cookies are small text files stored on your device when you visit a website. They help
            the site remember your preferences and understand how you interact with it. We use cookies
            and similar technologies (like localStorage) to provide a better experience.
          </Section>

          <Section title="How We Use Cookies">
            We use cookies for three purposes:
            <div className="mt-3 space-y-3">
              <CookieCategory title="Essential Cookies" desc="Required for the platform to function. These handle authentication, security, and session management. They cannot be disabled." />
              <CookieCategory title="Functional Cookies" desc="Remember your preferences like theme and language settings. Disabling these means you'd need to set preferences each visit." />
              <CookieCategory title="Analytics Cookies" desc="Help us understand how people use Tynkerlab.ai so we can improve. These are anonymous and never linked to your identity." />
            </div>
          </Section>

          <Section title="Cookies We Use">
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-nyx-border">
                    <th className="text-left py-2 pr-4 text-gray-300 font-medium">Cookie</th>
                    <th className="text-left py-2 pr-4 text-gray-300 font-medium">Purpose</th>
                    <th className="text-left py-2 pr-4 text-gray-300 font-medium">Type</th>
                    <th className="text-left py-2 text-gray-300 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_TABLE.map((cookie) => (
                    <tr key={cookie.name} className="border-b border-nyx-border/50">
                      <td className="py-2 pr-4 text-white font-mono text-xs">{cookie.name}</td>
                      <td className="py-2 pr-4 text-gray-400">{cookie.purpose}</td>
                      <td className="py-2 pr-4 text-gray-400">{cookie.type}</td>
                      <td className="py-2 text-gray-400">{cookie.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="What We Don't Do">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>We do not use third-party advertising cookies.</li>
              <li>We do not sell cookie data to third parties.</li>
              <li>We do not use cookies to track you across other websites.</li>
              <li>We do not use fingerprinting techniques.</li>
            </ul>
          </Section>

          <Section title="Managing Cookies">
            You can control cookies through your browser settings. Most browsers allow you to block
            or delete cookies. Note that disabling essential cookies will prevent you from logging in
            and using the platform.
          </Section>

          <Section title="Changes to This Policy">
            We may update this Cookie Policy from time to time. Changes will be posted on this page
            with an updated date.
          </Section>

          <Section title="Contact">
            Questions about our use of cookies? Contact us at{' '}
            <a href="mailto:support@tynkerlab.ai" className="text-primary-400 hover:underline">support@tynkerlab.ai</a>.
          </Section>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      <div className="text-sm text-gray-400 leading-relaxed">{children}</div>
    </section>
  )
}

function CookieCategory({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-3 bg-nyx-bg border border-nyx-border rounded-lg">
      <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  )
}
