import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const publicNav = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/for-respondents", label: "For Respondents" },
  { href: "/for-researchers", label: "For Researchers" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar
        items={publicNav}
        actions={
          <>
            <Link href="/login" className="hidden text-sm font-medium text-gray-600 transition hover:text-gray-900 sm:inline">
              Login
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Sign Up
            </Link>
          </>
        }
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}
