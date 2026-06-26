import Link from "next/link";
import { CircleDollarSign, ClipboardList, Clock, CreditCard } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">Pricing</h1>
      <p className="mt-2 text-gray-600">
        Researchers pay based on estimated survey completion time — not question count. Rewards are
        calculated automatically and shown before payment.
      </p>

      <div className="card mt-12 border-2 border-primary-500 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
          Start for free
        </span>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-4xl font-extrabold">₦0</p>
            <p className="mt-1 text-sm text-gray-400">No signup fee · No subscription</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-primary-400" />
                Respondents earn ₦60/min (standard) or ₦120/min (premium surveys)
              </li>
              <li className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary-400" />
                Researchers build draft campaigns at no cost
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary-400" />
                Pay in full via Paystack when you launch a live study
              </li>
            </ul>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <Link href="/register?role=respondent" className="btn-primary bg-white text-gray-900 hover:bg-gray-100">
              Start earning free
            </Link>
            <Link
              href="/register?role=researcher"
              className="inline-flex items-center justify-center rounded-btn border border-gray-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-gray-900">How time-based pricing works</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            <p className="text-lg font-bold text-gray-900">Estimated completion time</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Each question type has a fixed time weight (e.g. yes/no 2s, short text 15s, long text 45s).
            Total time drives the reward per respondent.
          </p>
        </div>
        <div className="card border-primary-100 bg-primary-50/30">
          <p className="text-lg font-bold text-gray-900">Prepay in full at launch</p>
          <p className="mt-2 text-sm text-gray-600">
            Total cost = (reward × responses) + platform fee (25%). Preview pricing before payment —
            no manual reward overrides.
          </p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-gray-900">Example</h2>
      <div className="card mt-6 max-w-md">
        <p className="text-sm text-gray-600">5-minute survey · 100 responses · verified audience</p>
        <hr className="my-4 border-gray-100" />
        <p className="text-sm text-gray-600">Reward per response: ₦300</p>
        <p className="text-sm text-gray-600">Response cost: ₦30,000</p>
        <p className="text-sm text-gray-600">Platform fee (25%): ₦7,500</p>
        <p className="mt-2 font-semibold text-primary-600">Total: ₦37,500</p>
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/register?role=researcher" className="btn-primary">
          Launch Your First Survey
        </Link>
        <Link href="/register?role=respondent" className="btn-secondary">
          Start for free as a respondent
        </Link>
      </div>
    </div>
  );
}
