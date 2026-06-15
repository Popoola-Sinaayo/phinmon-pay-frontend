import Link from "next/link";
import { CircleDollarSign, ClipboardList, CreditCard } from "lucide-react";
import { calculateSurveyCost } from "@/lib/utils";

export default function PricingPage() {
  const examples = [100, 200, 500].map((n) => ({
    responses: n,
    ...calculateSurveyCost(n, 500),
  }));

  return (
    <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Pricing</h1>
      <p className="mt-2 text-gray-600">
        Researchers pay per response. Pricing depends on response count, audience quality, and survey
        complexity.
      </p>

      {/* Start for free */}
      <div className="card mt-12 border-2 border-gray-900 bg-gray-900 text-white">
        <span className="inline-flex rounded-full bg-primary-500 px-3 py-1 text-xs font-bold">
          Start for free
        </span>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-4xl font-extrabold">₦0</p>
            <p className="mt-1 text-sm text-gray-400">No signup fee · No subscription</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-primary-400" />
                Respondents join, verify NIN, and earn — free to start
              </li>
              <li className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary-400" />
                Researchers build draft campaigns at no cost
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary-400" />
                Pay only when you launch a live study
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

      <h2 className="mt-12 text-xl font-semibold text-gray-900">Choose how you pay</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card">
          <p className="text-lg font-bold text-gray-900">Prepay in full</p>
          <p className="mt-2 text-sm text-gray-600">
            Pay the entire campaign cost upfront at launch via Paystack checkout. Best for fixed-budget
            studies.
          </p>
        </div>
        <div className="card border-primary-100 bg-primary-50/30">
          <p className="text-lg font-bold text-gray-900">Pay as you go</p>
          <p className="mt-2 text-sm text-gray-600">
            Save your card and pay per response as they come in. Set a spending cap — campaigns pause
            automatically when reached. If a charge fails, the survey locks until you update your card
            and settle any outstanding balance.
          </p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-gray-900">Campaign pricing examples</h2>
      <p className="mt-1 text-sm text-gray-500">15% platform fee included in totals below.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {examples.map((ex) => (
          <div key={ex.responses} className="card">
            <p className="text-2xl font-bold">{ex.responses} Responses</p>
            <p className="mt-2 text-sm text-gray-500">₦500 per response</p>
            <hr className="my-4 border-gray-100" />
            <p className="text-sm text-gray-600">Response cost: ₦{ex.budget.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Platform fee (15%): ₦{ex.platformFee.toLocaleString()}</p>
            <p className="mt-2 font-semibold text-primary-600">
              Total: ₦{ex.totalCost.toLocaleString()}
            </p>
          </div>
        ))}
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
