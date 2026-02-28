import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Privacy Policy | Tynkerlab.ai',
  description: 'How Tynkerlab.ai collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: February 26, 2026</p>

        <div className="prose-nyx space-y-8">
          <Section title="1. Introduction">
            Tynkerlab.ai (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the tynkerlab.ai website and related services.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </Section>

          <Section title="2. Information We Collect">
            <BulletList items={[
              'Account information: name, email address, and password hash when you create an account.',
              'Profile data: avatar image and display preferences you choose to set.',
              'Usage data: pages visited, features used, generation prompts, and interactions with the platform.',
              'Payment information: billing details are processed by Stripe and never stored on our servers.',
              'Device data: IP address (hashed), browser type, and operating system for analytics and security.',
              'Generated content: images and videos you create using our AI tools.',
            ]} />
          </Section>

          <Section title="3. How We Use Your Information">
            <BulletList items={[
              'Provide, maintain, and improve our services.',
              'Process transactions and manage your subscription.',
              'Track credit usage and enforce rate limits.',
              'Send account-related communications (receipts, security alerts, service updates).',
              'Analyze usage patterns to improve the platform (aggregated and anonymized).',
              'Prevent fraud, abuse, and violations of our terms.',
            ]} />
          </Section>

          <Section title="4. Data Sharing">
            We do not sell your personal information. We share data only with:
            <BulletList items={[
              'Together.ai — to process your generation requests (prompts are sent to their API).',
              'Stripe — to process payments securely.',
              'Appwrite — our backend infrastructure provider for authentication and storage.',
              'Law enforcement — only when required by law or to protect our rights.',
            ]} />
          </Section>

          <Section title="5. Your Generated Content">
            Images and videos you generate are stored in your account and are private by default.
            We do not use your generated content to train AI models. You retain ownership of your
            creations, subject to the underlying AI model licenses.
          </Section>

          <Section title="6. Data Retention">
            We retain your account data for as long as your account is active. Generated content is
            stored for the lifetime of your account. You can delete individual generations or your
            entire account at any time from your dashboard settings.
          </Section>

          <Section title="7. Security">
            We implement industry-standard security measures including encrypted connections (TLS),
            hashed passwords, and role-based access controls. However, no method of transmission
            over the internet is 100% secure.
          </Section>

          <Section title="8. Cookies">
            We use essential cookies for authentication and session management. We do not use
            third-party advertising cookies. See our Cookie Policy for details.
          </Section>

          <Section title="9. Your Rights">
            Depending on your jurisdiction, you may have the right to:
            <BulletList items={[
              'Access the personal data we hold about you.',
              'Request correction of inaccurate data.',
              'Request deletion of your data.',
              'Object to or restrict processing of your data.',
              'Export your data in a portable format.',
            ]} />
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by posting the updated policy on this page and updating the &quot;Last updated&quot; date.
          </Section>

          <Section title="11. Contact Us">
            If you have questions about this Privacy Policy, contact us at{' '}
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 mt-2">
      {items.map((item) => (
        <li key={item.slice(0, 30)}>{item}</li>
      ))}
    </ul>
  )
}
