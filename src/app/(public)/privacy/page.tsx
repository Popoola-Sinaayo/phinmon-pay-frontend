import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Phinmon",
  description:
    "How Phinmon collects, uses, and protects your personal data, including Google Analytics and Crisp chat.",
};

const LAST_UPDATED = "21 July 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-primary-600">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink-900">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-ink-500">Last updated: {LAST_UPDATED}</p>
      <p className="mt-6 text-base leading-relaxed text-ink-700">
        This Privacy Policy explains how Phinmon (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
        operated by Evergreene Software Ltd, collects, uses, stores, and protects your information when
        you use our website and services. We are committed to handling personal data responsibly and in
        line with Nigeria&apos;s Nigeria Data Protection Act (NDPA) / NDPR principles. Using Phinmon
        requires accepting this Privacy Policy and our{" "}
        <Link href="/terms" className="font-medium text-primary-600 hover:underline">
          Terms of Service
        </Link>
        .
      </p>

      <div className="prose-privacy mt-12 space-y-10 text-ink-700">
        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">1. Who we are</h2>
          <p className="mt-3 leading-relaxed">
            Phinmon is a verified insights marketplace that connects respondents who share opinions in
            paid studies with researchers who run research campaigns. Our platform is built and operated
            in Nigeria.
          </p>
          <p className="mt-3 leading-relaxed">
            For privacy questions, contact us via in-app chat (Crisp) or through{" "}
            <a
              href="https://www.evergreenesoftware.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary-600 hover:underline"
            >
              Evergreene Software Ltd
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            2. Information we collect
          </h2>
          <p className="mt-3 leading-relaxed">Depending on how you use Phinmon, we may collect:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong className="text-ink-900">Account details:</strong> name, email address, role
              (respondent, researcher, or admin), account status, and records of your acceptance of our
              Terms and this Privacy Policy.
            </li>
            <li>
              <strong className="text-ink-900">Identity verification data:</strong> legal name, date of
              birth, National Identification Number (NIN) verification results, and (where enabled)
              liveness checks. We do <strong className="text-ink-900">not</strong> store your raw
              (plaintext) NIN on the platform. After verification we retain your NIN only in{" "}
              <strong className="text-ink-900">encrypted</strong> form, plus a one-way hash, so we can
              verify identity and <strong className="text-ink-900">prevent the same NIN from being
              registered on more than one account</strong>. We do not use NIN for marketing.
            </li>
            <li>
              <strong className="text-ink-900">Profile information:</strong> demographics you provide
              (for example gender, state, occupation) to improve study matching.
            </li>
            <li>
              <strong className="text-ink-900">Survey and campaign data:</strong> survey responses you
              submit, campaign settings you create, and related research content.
            </li>
            <li>
              <strong className="text-ink-900">Payment and wallet data:</strong> transaction records,
              withdrawal requests, and bank account details needed to pay you or process researcher
              payments (via our payment partners).
            </li>
            <li>
              <strong className="text-ink-900">Support communications:</strong> messages you send us
              through chat or email.
            </li>
            <li>
              <strong className="text-ink-900">Technical and usage data:</strong> IP address, device/browser
              type, pages visited, approximate location derived from IP, and similar diagnostics needed
              to run and secure the service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            3. How we use your information
          </h2>
          <p className="mt-3 leading-relaxed">We use personal data to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>Create and manage your account, including OTP sign-in</li>
            <li>Verify identity and prevent fraud or duplicate accounts</li>
            <li>Operate surveys, campaigns, wallets, and payouts</li>
            <li>Send service emails (sign-in codes, survey alerts, account notices)</li>
            <li>Provide customer support and respond to your messages</li>
            <li>Understand how people use Phinmon so we can improve the product</li>
            <li>Meet legal, security, and compliance obligations</li>
          </ul>
          <p className="mt-4 rounded-xl border border-primary-100 bg-primary-50/50 px-4 py-3 text-sm leading-relaxed text-ink-800">
            We do <strong>not</strong> sell your personal data. We do not use analytics or chat tools to
            build advertising profiles for unrelated third-party marketing. Tools described below are used
            only to study how users interact with Phinmon and to reply to users on our platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            4. Google Analytics
          </h2>
          <p className="mt-3 leading-relaxed">
            We use <strong className="text-ink-900">Google Analytics</strong> to understand how visitors
            and users navigate Phinmon — for example which pages are visited, how often features are used,
            and where people drop off. This helps us improve product design, performance, and content.
            Analytics scripts load only after you accept non-essential cookies in our cookie banner (or
            equivalent preference).
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              Purpose: study usage of <em>our</em> platform only (product improvement and performance).
            </li>
            <li>
              We do not use Google Analytics to sell your data or to enable unrelated third-party
              advertising against your Phinmon profile.
            </li>
            <li>
              Google may process technical data (such as truncated IP, device/browser info, and page
              events) under its own terms as our analytics processor. See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary-600 hover:underline"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">5. Crisp chat</h2>
          <p className="mt-3 leading-relaxed">
            We use <strong className="text-ink-900">Crisp</strong> to power in-app customer support chat so
            we can answer questions, help with account issues, and reply to users on our platform. The
            chat widget loads only after you accept non-essential cookies.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              Purpose: support conversations only — helping you use Phinmon and resolving issues you raise.
            </li>
            <li>
              Chat content, and basic identifiers you share in chat (such as name or email if provided),
              are used so our team can respond to you. They are not sold or licensed for unrelated
              third-party marketing use by us.
            </li>
            <li>
              Crisp processes chat data as our support tooling provider. See{" "}
              <a
                href="https://crisp.chat/en/privacy/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary-600 hover:underline"
              >
                Crisp&apos;s Privacy Policy
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            6. Cookies and similar technologies
          </h2>
          <p className="mt-3 leading-relaxed">
            We use <strong className="text-ink-900">essential</strong> cookies and similar technologies
            that are necessary to keep you signed in, protect accounts, and remember security preferences.
            <strong className="text-ink-900"> Non-essential</strong> analytics (Google Analytics) and
            support chat (Crisp) cookies or scripts load only if you accept them via our cookie banner.
            You can change your browser settings to block cookies; blocking essential cookies may limit
            parts of the service (for example staying logged in).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            7. Service providers and sharing
          </h2>
          <p className="mt-3 leading-relaxed">
            We share data only with trusted processors who help us run Phinmon, and only as needed for
            that purpose — not for their independent commercial use of your Phinmon data. These may
            include:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong className="text-ink-900">Identity verification providers</strong> (for example
              QoreID) for NIN / liveness checks
            </li>
            <li>
              <strong className="text-ink-900">Payment processors</strong> (for example Paystack) for
              deposits, transfers, and payouts
            </li>
            <li>
              <strong className="text-ink-900">Email delivery</strong> for OTP codes and service messages
            </li>
            <li>
              <strong className="text-ink-900">Google Analytics</strong> and{" "}
              <strong className="text-ink-900">Crisp</strong>, as described above (when you consent)
            </li>
            <li>
              <strong className="text-ink-900">Hosting and infrastructure</strong> providers that store or
              transmit data securely
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            We may also disclose information if required by law, regulation, court order, or to protect
            the rights, safety, and integrity of Phinmon, our users, or the public.
          </p>
          <p className="mt-3 leading-relaxed">
            When you complete a survey, researchers receive your responses together with an anonymised
            respondent identifier and limited verification flags needed for research quality (for example
            whether NIN verification is complete). They do not receive your email or legal name in
            standard response exports. They are expected to use that data only for the study purpose and
            not for unrelated third-party resale.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">8. Data security</h2>
          <p className="mt-3 leading-relaxed">
            We use technical and organisational measures appropriate to the sensitivity of the data,
            including encryption for sensitive identity fields (such as NIN), access controls, and secure
            transmission. No method of transmission or storage is 100% secure; we work to reduce risk and
            respond to incidents promptly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">9. Data retention</h2>
          <p className="mt-3 leading-relaxed">
            We keep personal data only as long as needed for the purposes in this policy — including
            operating your account, completing payouts, preventing fraud (including encrypted NIN and
            hash records used to block duplicate NINs), and meeting legal or accounting requirements.
            When data is no longer required, we delete or anonymise it where practicable.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">10. Your rights</h2>
          <p className="mt-3 leading-relaxed">
            Subject to applicable Nigerian data protection law, you may have the right to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>Access personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion or restriction, where legally available</li>
            <li>Object to certain processing</li>
            <li>Withdraw consent where processing is consent-based (including non-essential cookies)</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            You can request account deletion from Settings in the product. You may also contact us through
            Crisp chat or via Evergreene Software Ltd. We may need to verify your identity, settle open
            balances, and retain limited records where required for fraud prevention, accounting, or law
            before completing a deletion request.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            11. Children&apos;s privacy
          </h2>
          <p className="mt-3 leading-relaxed">
            Phinmon is intended for adults aged 18 and over who can lawfully create an account and
            complete identity verification. We do not knowingly collect personal data from children. If
            you believe a child has provided data to us, contact us so we can take appropriate action.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            12. International processing
          </h2>
          <p className="mt-3 leading-relaxed">
            Some providers (including Google Analytics and Crisp) may process data on servers outside
            Nigeria. Where that happens, we rely on appropriate contractual and organisational
            safeguards and use those providers only for the platform purposes described in this policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">
            13. Changes to this policy
          </h2>
          <p className="mt-3 leading-relaxed">
            We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the
            top will change when we do. Material changes may require in-product re-acceptance of this
            Privacy Policy together with our Terms of Service before you continue using Phinmon.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink-900">14. Contact</h2>
          <p className="mt-3 leading-relaxed">
            Questions about privacy, Google Analytics, Crisp chat, or your data rights: use the Crisp
            chat widget on Phinmon (when enabled), or reach Evergreene Software Ltd at{" "}
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
        <Link href="/terms" className="font-medium text-primary-600 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/how-it-works" className="font-medium text-primary-600 hover:underline">
          How It Works
        </Link>
        .
      </p>
    </div>
  );
}
