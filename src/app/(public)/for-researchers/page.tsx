import Link from "next/link";

export default function ForResearchersPage() {
  return (
    <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">Collect Quality Insights Faster</h1>
      <p className="mt-4 max-w-2xl text-gray-600">
        Build tasks, target NIN-verified respondents, fund your project, and export results — all
        in one platform. Premium (liveness-verified) targeting is coming soon.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          "Market Research",
          "Product Validation",
          "Brand Testing",
          "Customer Feedback",
          "Startup Validation",
          "Academic Research",
        ].map((type) => (
          <div key={type} className="card text-sm font-medium text-gray-700">
            {type}
          </div>
        ))}
      </div>
      <Link href="/register?role=researcher" className="btn-primary mt-8 inline-flex">
        Create Research Project
      </Link>
    </div>
  );
}
