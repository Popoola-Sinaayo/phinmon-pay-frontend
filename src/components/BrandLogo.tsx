import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  textClassName?: string;
  onDark?: boolean;
};

const sizes = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 34, text: "text-lg" },
  lg: { icon: 42, text: "text-xl" },
};

function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <rect width="40" height="40" rx="11" fill="#1a1815" />
      {/* Serif "P" counter as a quiet editorial monogram */}
      <path
        d="M13.5 11.5h8.2c4 0 6.6 2.4 6.6 6.1 0 3.8-2.7 6.2-6.9 6.2h-3.6v5.7"
        stroke="#FBFAF7"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Green "verified" accent dot  trust + money */}
      <circle cx="28.4" cy="27.8" r="3.1" fill="#1f9d63" />
    </svg>
  );
}

export function BrandLogo({
  href = "/",
  size = "md",
  showText = true,
  className,
  textClassName,
  onDark = false,
}: BrandLogoProps) {
  const { icon, text } = sizes[size];

  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={icon} />
      {showText && (
        <span
          className={cn(
            "font-display font-semibold tracking-tight",
            text,
            onDark ? "text-white" : "text-ink-900",
            textClassName
          )}
        >
          Phinmon
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
