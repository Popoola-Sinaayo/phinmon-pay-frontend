import {
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** If true, only exact path match counts as active */
  exact?: boolean;
};

export const RESPONDENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard, exact: true },
  { href: "/surveys", label: "Surveys", shortLabel: "Surveys", icon: ClipboardList },
  { href: "/wallet", label: "Wallet", shortLabel: "Wallet", icon: Wallet },
  { href: "/verification", label: "Verification", shortLabel: "Verify", icon: ShieldCheck, exact: true },
  { href: "/settings", label: "Settings", shortLabel: "Settings", icon: Settings, exact: true },
];

export const RESEARCHER_NAV: NavItem[] = [
  { href: "/researcher/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard, exact: true },
  { href: "/researcher/campaigns", label: "Campaigns", shortLabel: "Campaigns", icon: ClipboardList },
  { href: "/settings", label: "Settings", shortLabel: "Settings", icon: Settings, exact: true },
];

export const RESEARCHER_CREATE: NavItem = {
  href: "/researcher/campaigns/new",
  label: "New Campaign",
  shortLabel: "Create",
  icon: PlusCircle,
};

export function getNavForRole(role: string): NavItem[] {
  if (role === "researcher" || role === "admin") return RESEARCHER_NAV;
  return RESPONDENT_NAV;
}

export function getHomeForRole(role: string): string {
  if (role === "researcher" || role === "admin") return "/researcher/dashboard";
  return "/dashboard";
}

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  if (item.href === "/researcher/campaigns") {
    return (
      pathname === "/researcher/campaigns" ||
      (pathname.startsWith("/researcher/campaigns/") &&
        !pathname.startsWith("/researcher/campaigns/new") &&
        !pathname.startsWith("/researcher/campaigns/payment"))
    );
  }
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function getPageTitle(pathname: string, role: string): string {
  const nav = getNavForRole(role);
  const match = nav.find((item) => isNavActive(pathname, item));
  if (match) return match.label;
  if (pathname.includes("/withdraw")) return "Withdraw";
  if (pathname.includes("/campaigns/new")) return "New Campaign";
  if (pathname.match(/\/campaigns\/[^/]+$/)) return "Campaign";
  if (pathname.includes("/take")) return "Survey";
  return "Phinmon";
}
