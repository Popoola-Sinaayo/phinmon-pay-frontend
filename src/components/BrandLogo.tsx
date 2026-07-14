"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  /** Show the PHINMON wordmark beside the mark (horizontal lockup). */
  showText?: boolean;
  className?: string;
  textClassName?: string;
  /** Use white mark + wordmark for dark backgrounds. */
  onDark?: boolean;
  /**
   * `mark` — icon only (or icon + text if showText).
   * `stacked` — full stacked lockup image (ignores showText).
   * `horizontal` — full horizontal lockup image (ignores showText).
   */
  variant?: "mark" | "stacked" | "horizontal";
};

const sizes = {
  sm: { icon: 28, text: "text-[13px]", lockupH: 28, stackedH: 56 },
  md: { icon: 34, text: "text-base", lockupH: 34, stackedH: 72 },
  lg: { icon: 42, text: "text-lg", lockupH: 40, stackedH: 96 },
};

/** Vector mark — uses currentColor so it inherits text color. */
export function PhinmonMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M26 70 A 31 31 0 1 1 22 66"
        stroke="currentColor"
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <path
        d="M26 70 L26 28 C26 21 31.5 17 39 17 C48.5 17 55.5 24.5 55.5 34.5 C55.5 44.5 48.5 52 39 52 C33 52 28.5 48.5 26 44"
        stroke="currentColor"
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  variant = "mark",
}: BrandLogoProps) {
  const { icon, text, lockupH, stackedH } = sizes[size];

  let content: React.ReactNode;

  if (variant === "stacked") {
    content = (
      <Image
        src={onDark ? "/brand/phinmon-logo-stacked-white.png" : "/brand/phinmon-logo-stacked.png"}
        alt="Phinmon"
        width={Math.round(stackedH * 0.9)}
        height={stackedH}
        className={cn("h-auto w-auto object-contain", className)}
        style={{ height: stackedH, width: "auto" }}
        priority
      />
    );
  } else if (variant === "horizontal") {
    content = (
      <Image
        src={
          onDark
            ? "/brand/phinmon-logo-horizontal-white.png"
            : "/brand/phinmon-logo-horizontal.png"
        }
        alt="Phinmon"
        width={Math.round(lockupH * 5.5)}
        height={lockupH}
        className={cn("h-auto w-auto object-contain", className)}
        style={{ height: lockupH, width: "auto" }}
        priority
      />
    );
  } else {
    content = (
      <span
        className={cn(
          "inline-flex items-center gap-2.5",
          onDark ? "text-white" : "text-ink-900",
          className
        )}
      >
        {/* Prefer extracted raster for exact brand fidelity */}
        <Image
          src={onDark ? "/brand/phinmon-mark-white.png" : "/brand/phinmon-mark.png"}
          alt=""
          width={icon}
          height={icon}
          className="shrink-0 object-contain"
          aria-hidden
          priority
        />
        {showText && (
          <span
            className={cn(
              "font-sans text-[0.95em] font-bold uppercase tracking-[0.08em]",
              text,
              textClassName
            )}
          >
            Phinmon
          </span>
        )}
      </span>
    );
  }

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label="Phinmon home">
        {content}
      </Link>
    );
  }

  return content;
}
