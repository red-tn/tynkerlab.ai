import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Terms of Service | Tynkerlab.ai',
  description: 'Terms and conditions for using the Tynkerlab.ai AI generation platform.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: February 26, 2026</p>

        <div className="space-y-8">
          <Section title="1. Acceptance of Terms">
            By accessing or using Tynkerlab.ai (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
            If you do not agree, you may not use the Service. We may update these terms at any time, and
            continued use constitutes acceptance of the updated terms.
          </Section>

          <Section title="2. Account Registration">
            You must create an account to access most features. You are responsible for maintaining
            the confidentiality of your credentials and for all activity under your account. You must
            be at least 18 years old (or the age of majority in your jurisdiction) to use the Service.
          </Section>

          <Section title="3. Credits and Payments">
            Tynkerlab.ai uses a credit-based system. Credits are consumed when you generate images or videos.
            Credit costs vary by model and are displayed before each generation.
            <BulletList items={[
              'Subscriptions auto-renew unless cancelled before the billing date.',
              'Credit packs are one-time purchases and do not expire.',
              'Monthly subscription credits reset at each billing cycle and do not roll over.',
              'Refunds for unused credits are handled on a case-by-case basis.',
              'We reserve the right to modify pricing with 30 days notice to active subscribers.',
            ]} />
          </Section>

          <Section title="4. Acceptable Use">
            You agree not to use the Service to:
            <BulletList items={[
              'Generate content that is illegal, harmful, threatening, abusive, or hateful.',
              'Create deepfakes or non-consensual imagery of real individuals.',
              'Generate child sexual abuse material (CSAM) — this results in immediate termination and reporting.',
              'Infringe on intellectual property rights of others.',
              'Attempt to reverse-engineer, decompile, or extract model weights.',
              'Circumvent rate limits, credit checks, or other technical restrictions.',
              'Use automated tools to scrape or bulk-download content from the platform.',
              'Resell or redistribute AI model access without authorization.',
            ]} />
          </Section>

          <Section title="5. Generated Content">
            You retain ownership of content you generate, subject to the following:
            <BulletList items={[
              'Generated content is subject to the underlying AI model provider\'s license terms.',
              'We do not claim ownership of your generated content.',
              'We may remove content that violates these terms or applicable law.',
              'You grant us a limited license to store and serve your content back to you.',
            ]} />
          </Section>

          <Section title="6. Intellectual Property">
            The Tynkerlab.ai platform, including its design, code, and branding, is owned by us and protected
            by copyright and trademark law. You may not copy, modify, or distribute any part of the
            platform without written permission.
          </Section>

          <Section title="7. Service Availability">
            We strive for high availability but do not guarantee uninterrupted access. The Service
            depends on third-party AI providers whose availability is outside our control. We are not
            liable for failed generations due to upstream provider outages.
          </Section>

          <Section title="8. Limitation of Liability">
            To the maximum extent permitted by law, Tynkerlab.ai shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Service.
            Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
          </Section>

          <Section title="9. Account Suspension and Termination">
            We may suspend or terminate your account if you violate these terms. Upon termination,
            your right to use the Service ceases immediately. We may retain your data as required by
            law. You may delete your account at any time from your dashboard settings.
          </Section>

          <Section title="10. Dispute Resolution">
            Any disputes arising from these terms shall be resolved through binding arbitration in
            accordance with applicable arbitration rules. You agree to waive your right to a jury
            trial and to participate in class action lawsuits.
          </Section>

          <Section title="11. Contact">
            Questions about these Terms? Contact us at{' '}
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
