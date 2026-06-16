import Image from "next/image";
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
  md: { icon: 36, text: "text-lg" },
  lg: { icon: 44, text: "text-xl" },
};

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
      <Image
        src="/logo.png"
        alt="Phinmon"
        width={icon}
        height={icon}
        className="rounded-[22%] shadow-subtle"
        priority
      />
      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight",
            text,
            onDark ? "text-white" : "text-gray-900",
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
