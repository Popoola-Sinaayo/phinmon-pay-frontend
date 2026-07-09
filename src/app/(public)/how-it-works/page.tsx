export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">How It Works</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-primary-600">For Respondents</h2>
          <ol className="mt-4 space-y-4">
            {["Create Account", "Verify Identity with NIN", "Complete Tasks", "Earn Money"].map(
              (step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-gray-700">{step}</span>
                </li>
              )
            )}
          </ol>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-secondary-600">For Researchers</h2>
          <ol className="mt-4 space-y-4">
            {["Create Project", "Fund Project", "Receive Responses", "Analyze Insights"].map(
              (step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-sm font-bold text-secondary-700">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-gray-700">{step}</span>
                </li>
              )
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
