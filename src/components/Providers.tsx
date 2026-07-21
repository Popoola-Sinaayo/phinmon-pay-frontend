"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CrispChat } from "@/components/CrispChat";
import { CookieConsent } from "@/components/CookieConsent";
import { ConditionalAnalytics } from "@/components/ConditionalAnalytics";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
      <CookieConsent />
      <ConditionalAnalytics />
      <CrispChat />
    </QueryClientProvider>
  );
}
