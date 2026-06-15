"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card flex flex-col items-center py-12 text-center"
    >
      <motion.div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-secondary-50 text-4xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        📋
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
      {actionLabel && actionHref && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
          <Link href={actionHref} className="btn-primary">
            {actionLabel}
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
