"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyNinRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/verification?step=nin");
  }, [router]);

  return null;
}
