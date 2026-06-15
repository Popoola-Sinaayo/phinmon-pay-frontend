export function PremiumBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      Premium
    </span>
  );
}

export function VerificationBadge({ status }: { status: "not_started" | "pending" | "verified" | "failed" | "locked" }) {
  const styles = {
    not_started: "bg-gray-100 text-gray-700",
    pending: "bg-warning-500/10 text-warning-600",
    verified: "bg-primary-100 text-primary-700",
    failed: "bg-error-500/10 text-error-600",
    locked: "bg-gray-100 text-gray-500",
  };
  const labels = {
    not_started: "Not Started",
    pending: "Pending",
    verified: "Verified",
    failed: "Failed",
    locked: "Locked",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
