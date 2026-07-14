import Link from "next/link";

export default function ForRespondentsPage() {
  return (
    <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">Earn Money Sharing Your Opinions</h1>
      <p className="mt-4 max-w-2xl text-gray-600">
        Join Phinmon as a verified respondent. Complete NIN verification, complete tasks from
        top brands and researchers, and get paid directly to your bank account.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold">Standard Tasks</h3>
          <p className="mt-2 text-sm text-gray-500">Available after NIN verification</p>
        </div>
        <div className="card border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">Premium Tasks</h3>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              Coming soon
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Higher payouts with liveness verification  we&apos;re enabling this soon. For now, earn
            with NIN-verified tasks.
          </p>
        </div>
      </div>
      <Link href="/register?role=respondent" className="btn-primary mt-8 inline-flex">
        Start Earning
      </Link>
    </div>
  );
}
