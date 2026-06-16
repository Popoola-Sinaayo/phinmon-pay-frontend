import Link from "next/link";
import { CreditCard, Fingerprint, Lock, ShieldCheck } from "lucide-react";
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
  ],
};

const TRUST_BADGES = [
  { icon: Fingerprint, label: "NIN Verified" },
  { icon: CreditCard, label: "Paystack" },
  { icon: ShieldCheck, label: "CBN Compliant" },
  { icon: Lock, label: "NDPR Ready" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
        <FadeIn>
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <BrandLogo href="/" size="lg" onDark />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
                Nigeria&apos;s verified research marketplace. NIN-checked respondents,
                Paystack payouts, and export-ready survey data.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-400"
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
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Phinmon. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-sm text-gray-500">
              Built in Nigeria · Lagos · Abuja · PH
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
