import Link from "next/link";
import { CreditCard, Fingerprint } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { FadeIn } from "./motion";

const links = {
  Product: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/for-respondents", label: "For Respondents" },
    { href: "/for-researchers", label: "For Researchers" },
  ],
  Company: [
    { href: "/login", label: "Login" },
    { href: "/register", label: "Sign Up" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

const TRUST_BADGES = [
  { icon: Fingerprint, label: "NIN Verified" },
  { icon: CreditCard, label: "Bank Payouts" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950 text-white/70">
      <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
        <FadeIn>
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <BrandLogo href="/" size="lg" onDark />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
                Nigeria&apos;s verified insights marketplace. Get paid for your opinions,
                reach NIN-verified respondents, and cash out to your bank.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60"
                  >
                    <Icon className="h-3 w-3 text-primary-500" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            {Object.entries(links).map(([title, items]) => (
              <div key={title}>
                <h4 className="font-semibold text-white">{title}</h4>
                <ul className="mt-4 space-y-2">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-gray-400 transition-colors hover:text-primary-400"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Phinmon. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
                <Link
                  href="/terms"
                  className="text-sm text-gray-500 transition-colors hover:text-primary-400"
                >
                  Terms of Service
                </Link>
                <span className="text-gray-600" aria-hidden>
                  ·
                </span>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 transition-colors hover:text-primary-400"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-right">
              <p className="flex items-center gap-1 text-sm text-gray-500">
                Built in Nigeria · Lagos · Abuja · PH
              </p>
              <p className="text-sm text-gray-500">
                Powered by{" "}
                <a
                  href="https://www.evergreenesoftware.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Evergreene Software Ltd
                </a>
              </p>
              <a
                href="https://www.evergreenesoftware.com"
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-gray-500 hover:text-primary-400 transition-colors"
              >
                www.evergreenesoftware.com
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
