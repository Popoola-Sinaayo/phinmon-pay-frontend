import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Phinmon",
  description:
    "Terms of Service for Phinmon, Nigeria's verified insights marketplace operated by Evergreene Software Ltd.",
};

const LAST_UPDATED = "21 July 2026";

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-primary-600">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink-900">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-ink-500">Last updated: {LAST_UPDATED}</p>
      <p className="mt-6 text-base leading-relaxed text-ink-700">
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of Phinmon
        (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by Evergreene Software Ltd. By
        creating an account or using Phinmon, you agree to these Terms and our{" "}
        <Link href="/privacy" className="font-medium text-primary-600 hover:underline">
          Privacy Policy
        </Link>
        . You must accept both before using the platform.
      </p>

      <div className="prose-privacy mt-12 space-y-10 text-ink-700">
        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">1. Acceptance</h2>
          <p className="mt-3 leading-relaxed">
            You must review and accept these Terms and the Privacy Policy to register or continue
            using Phinmon. If you do not agree, do not create an account or use the service. When we
            update material terms, we may require you to accept the new version before you can keep
            using Phinmon.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">2. Eligibility</h2>
          <p className="mt-3 leading-relaxed">
            You must be at least 18 years old and able to form a binding contract under Nigerian law.
            Phinmon is intended for adults. By using the service, you confirm that the information you
            provide is accurate and that you will keep it up to date.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">3. Accounts and sign-in</h2>
          <p className="mt-3 leading-relaxed">
            Access is passwordless: we send one-time codes (OTP) to your email. You are responsible for
            keeping access to that email secure and for activity under your account. Notify us promptly
            if you suspect unauthorised use. We may suspend or terminate accounts that violate these
            Terms or that present fraud, abuse, or security risk.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            4. Identity verification (NIN)
          </h2>
          <p className="mt-3 leading-relaxed">
            Respondents may be required to verify their National Identification Number (NIN) through
            our identity verification providers (for example QoreID / NIMC pathways) before earning or
            withdrawing. You must provide your own legal details exactly as they appear on your official
            ID.
          </p>
          <p className="mt-3 leading-relaxed">
            We do <strong className="text-ink-900">not</strong> store your raw (plaintext) NIN on the
            platform. After verification, we retain your NIN only in <strong className="text-ink-900">encrypted</strong>{" "}
            form, plus a one-way hash. That lets us confirm you are unique and{" "}
            <strong className="text-ink-900">block the same NIN from being used on more than one account</strong>
            , while keeping the number unreadable at rest. We do not use your NIN for marketing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">5. Respondents</h2>
          <p className="mt-3 leading-relaxed">
            As a respondent, you may take eligible studies, earn rewards, and withdraw to a bank account
            you control, subject to verification, platform rules, and available balance. You agree to
            answer surveys honestly, not to create duplicate or fake accounts, and not to manipulate
            results or payouts. Rewards may be withheld or reversed if we detect fraud, spam, or Terms
            violations.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">6. Researchers</h2>
          <p className="mt-3 leading-relaxed">
            As a researcher, you may create campaigns, fund studies, and receive response data as
            described in the product and Privacy Policy. You are responsible for the legality and ethics
            of your research content, for how you use exported data, and for complying with applicable
            law. You must not use Phinmon to collect unlawful, harmful, or deceptive content, or to
            resell respondent personal data for unrelated purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            7. Payments, wallets, and fees
          </h2>
          <p className="mt-3 leading-relaxed">
            Payments and payouts are processed through partners such as Paystack. Wallet balances,
            withdrawal limits, fees, and settlement times may apply as shown in the product. You
            authorise us and our payment partners to process transactions you initiate. We are not a
            bank; funds handling is subject to partner and regulatory constraints.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">8. Prohibited use</h2>
          <p className="mt-3 leading-relaxed">You agree not to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>Use another person&apos;s NIN, identity, or bank account</li>
            <li>Create multiple accounts to game payouts or research quality</li>
            <li>Scrape, attack, reverse engineer, or disrupt the platform</li>
            <li>Upload illegal, abusive, or infringing content</li>
            <li>Circumvent verification, security, or payment controls</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">9. Intellectual property</h2>
          <p className="mt-3 leading-relaxed">
            Phinmon, its branding, software, and content (excluding your survey content and responses
            you submit under your role) are owned by Evergreene Software Ltd or its licensors. You
            receive a limited, non-exclusive licence to use the service as intended. Researchers retain
            rights in their campaign materials subject to these Terms and applicable law; respondents
            grant us and the relevant researcher a licence to use submitted responses for the study and
            platform operation.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            10. Disclaimers and limitation of liability
          </h2>
          <p className="mt-3 leading-relaxed">
            Phinmon is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the
            fullest extent permitted by Nigerian law, we disclaim warranties of uninterrupted
            availability, perfect accuracy of third-party verification or payment partners, or fitness
            for a particular research outcome. Our aggregate liability arising from your use of Phinmon
            is limited to the greater of (a) fees you paid us in the three months before the claim, or
            (b) ten thousand Naira (₦10,000), except where liability cannot be limited by law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">11. Suspension and termination</h2>
          <p className="mt-3 leading-relaxed">
            We may suspend or terminate access for Terms violations, fraud risk, legal requirements, or
            prolonged inactivity. You may request account deletion through the product settings or
            support channels; we may retain limited data where required for fraud prevention, accounting,
            or law, as described in the Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">12. Governing law</h2>
          <p className="mt-3 leading-relaxed">
            These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be
            subject to the courts of Nigeria, without prejudice to mandatory consumer protections that
            apply to you.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">13. Changes</h2>
          <p className="mt-3 leading-relaxed">
            We may update these Terms from time to time. The &quot;Last updated&quot; date will change
            when we do. Material changes may require in-product re-acceptance before you continue using
            Phinmon.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">14. Contact</h2>
          <p className="mt-3 leading-relaxed">
            Questions about these Terms: use in-app chat (Crisp) on Phinmon, or contact Evergreene
            Software Ltd at{" "}
            <a
              href="https://www.evergreenesoftware.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary-600 hover:underline"
            >
              www.evergreenesoftware.com
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-ink-500">
        See also our{" "}
        <Link href="/privacy" className="font-medium text-primary-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
