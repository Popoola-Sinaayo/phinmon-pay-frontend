"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Crisp } from "crisp-sdk-web";
import { api, getAuthToken } from "@/lib/api";
import type { User } from "@/types";

const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID?.trim();

export function CrispChat() {
  const pathname = usePathname();

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/auth/me");
      return data.user;
    },
    enabled: Boolean(websiteId) && typeof window !== "undefined" && !!getAuthToken(),
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!websiteId) return;
    Crisp.configure(websiteId);
  }, []);

  // Keep the widget visible on every route, including the marketing homepage (`/`).
  useEffect(() => {
    if (!websiteId) return;
    Crisp.chat.show();
  }, [pathname]);

  useEffect(() => {
    if (!websiteId || !user) return;
    Crisp.user.setEmail(user.email);
    if (user.name) Crisp.user.setNickname(user.name);
    Crisp.session.setData({
      user_id: user.id,
      role: user.role,
      status: user.status,
    });
  }, [user]);

  return null;
}
