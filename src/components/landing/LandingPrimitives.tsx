"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

export function SectionLabel({
  icon: Icon,
  text,
  color = "primary",
}: {
  icon: LucideIcon;
  text: string;
  color?: "primary" | "secondary" | "amber";
}) {
  const styles = {
    primary: "border-primary-200 bg-primary-50 text-primary-700",
    secondary: "border-secondary-200 bg-secondary-50 text-secondary-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
  };
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide ${styles[color]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </motion.span>
  );
}

export function Marquee({
  children,
  speed = 30,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex w-max gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

export function TextReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}
