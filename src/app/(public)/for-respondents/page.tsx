import Link from "next/link";

export default function ForRespondentsPage() {
  return (
    <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Earn Money Sharing Your Opinions</h1>
      <p className="mt-4 max-w-2xl text-gray-600">
        Join Phinmon as a verified respondent. Complete NIN verification, answer surveys from
        top brands and researchers, and get paid directly to your bank account.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold">Standard Surveys</h3>
          <p className="mt-2 text-sm text-gray-500">Available after NIN verification</p>
        </div>
        <div className="card border-amber-200 bg-amber-50">
          <h3 className="font-semibold">Premium Surveys</h3>
          <p className="mt-2 text-sm text-gray-500">Higher payouts with liveness verification</p>
        </div>
      </div>
      <Link href="/register?role=respondent" className="btn-primary mt-8 inline-flex">
        Start Earning
      </Link>
    </div>
  );
}
