"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Crisp } from "crisp-sdk-web";
import { api, getAuthToken } from "@/lib/api";
import type { User } from "@/types";

const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID?.trim();

/** Crisp's usual corner inset. */
const CRISP_DEFAULT_BOTTOM_PX = 20;
/** Extra lift so the bubble clears the mobile tab bar. */
const MOBILE_NAV_OFFSET_PX = 88;

function forceShowChat() {
  try {
    Crisp.chat.show();
  } catch {
    // Widget may not be ready yet.
  }
  if (typeof window !== "undefined" && Array.isArray(window.$crisp)) {
    window.$crisp.push(["do", "chat:show"]);
  }
}

function shouldOffsetForMobileNav() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(max-width: 1023px)").matches) return false;
  return document.body.classList.contains("has-mobile-bottom-nav");
}

function crispRoots(): HTMLElement[] {
  const roots: HTMLElement[] = [];
  const chatbox = document.getElementById("crisp-chatbox");
  const client = document.querySelector(".crisp-client");
  if (chatbox instanceof HTMLElement) roots.push(chatbox);
  if (client instanceof HTMLElement) roots.push(client);
  return roots;
}

/** Crisp nests the real fixed button; CSS on the wrapper often does nothing. */
function applyCrispMobileNavOffset() {
  const enabled = shouldOffsetForMobileNav();
  const liftedBottom = `calc(${CRISP_DEFAULT_BOTTOM_PX + MOBILE_NAV_OFFSET_PX}px + env(safe-area-inset-bottom, 0px))`;
  const roots = crispRoots();
  const targets = new Set<HTMLElement>();

  for (const root of roots) {
    targets.add(root);
    root.querySelectorAll<HTMLElement>("*").forEach((node) => {
      const style = window.getComputedStyle(node);
      if (style.position === "fixed" || node.tagName === "IFRAME") {
        targets.add(node);
      }
    });
  }

  for (const el of Array.from(targets)) {
    if (enabled) {
      el.style.setProperty("bottom", liftedBottom, "important");
      el.dataset.crispNavOffset = "1";
    } else if (el.dataset.crispNavOffset) {
      el.style.removeProperty("bottom");
      delete el.dataset.crispNavOffset;
    }
  }
}

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
    Crisp.session.onLoaded(() => {
      forceShowChat();
      applyCrispMobileNavOffset();
    });

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      forceShowChat();
      applyCrispMobileNavOffset();
      try {
        if ((Crisp.chat.isVisible() && crispRoots().length > 0) || attempts >= 24) {
          window.clearInterval(intervalId);
        }
      } catch {
        if (attempts >= 24) window.clearInterval(intervalId);
      }
    }, 250);

    const media = window.matchMedia("(max-width: 1023px)");
    const onViewportChange = () => applyCrispMobileNavOffset();
    media.addEventListener("change", onViewportChange);

    // Re-apply when Crisp injects nodes or the dashboard toggles the body class.
    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(applyCrispMobileNavOffset);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    applyCrispMobileNavOffset();

    return () => {
      window.clearInterval(intervalId);
      media.removeEventListener("change", onViewportChange);
      observer.disconnect();
      Crisp.session.offLoaded();
    };
  }, []);

  useEffect(() => {
    if (!websiteId) return;
    forceShowChat();
    applyCrispMobileNavOffset();
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
