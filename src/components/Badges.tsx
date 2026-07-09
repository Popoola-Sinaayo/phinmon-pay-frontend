import { cn } from "@/lib/utils";

export function ResponseStatusBadge({
  status,
  spamSuspected,
}: {
  status: string;
  spamSuspected?: boolean;
}) {
  const styles: Record<string, string> = {
    APPROVED: "bg-primary-50 text-primary-700",
    PENDING: "bg-amber-50 text-amber-700",
    REJECTED: "bg-error-500/10 text-error-600",
    FLAGGED: "bg-error-500/10 text-error-600",
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
          styles[status] || "bg-gray-100 text-gray-600"
        )}
      >
        {status.toLowerCase()}
      </span>
      {spamSuspected && (
        <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
          Possible spam
        </span>
      )}
    </span>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      Premium
    </span>
  );
}

const campaignStatusStyles: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-primary-100 text-primary-700",
  PAUSED: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-secondary-100 text-secondary-700",
  CANCELLED: "bg-error-500/10 text-error-600",
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const style = campaignStatusStyles[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", style)}>
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function VerificationBadge({
  status,
}: {
  status: "not_started" | "pending" | "verified" | "failed" | "locked" | "coming_soon";
}) {
  const styles = {
    not_started: "bg-gray-100 text-gray-700",
    pending: "bg-warning-500/10 text-warning-600",
    verified: "bg-primary-100 text-primary-700",
    failed: "bg-error-500/10 text-error-600",
    locked: "bg-gray-100 text-gray-500",
    coming_soon: "bg-blue-50 text-blue-700",
  };
  const labels = {
    not_started: "Not Started",
    pending: "Pending",
    verified: "Verified",
    failed: "Failed",
    locked: "Locked",
    coming_soon: "Coming Soon",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
