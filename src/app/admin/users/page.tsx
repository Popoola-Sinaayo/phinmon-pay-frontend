"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { DataTable } from "@/components/DataTable";
import { AdminShell } from "@/components/layout/AdminShell";
import { Pagination } from "@/components/admin/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import type { User, UserRole, UserStatus } from "@/types";

type UsersResponse = {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const ROLES: Array<"" | UserRole> = ["", "respondent", "researcher", "admin"];
const STATUSES: Array<"" | UserStatus> = [
  "",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "PREMIUM",
  "SUSPENDED",
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: authUser, isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | UserRole>("");
  const [status, setStatus] = useState<"" | UserStatus>("");
  const [ninVerified, setNinVerified] = useState<"" | "true" | "false">("");

  useEffect(() => {
    if (!authLoading && (!authUser || authUser.role !== "admin")) router.push("/login");
  }, [authUser, authLoading, router]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-users", page, search, role, status, ninVerified],
    queryFn: async () => {
      const res = await api.get("/admin/users", {
        params: {
          page,
          limit: 20,
          ...(search ? { q: search } : {}),
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
          ...(ninVerified ? { ninVerified } : {}),
        },
      });
      return res.data as UsersResponse;
    },
    enabled: authUser?.role === "admin",
    placeholderData: (prev) => prev,
  });

  return (
    <AdminShell title="Users" subtitle="Full account directory with filters and pagination" backHref="/admin">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="relative min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
            Search
          </span>
          <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-ink-500/60" />
          <input
            className="input pl-9"
            placeholder="Name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label className="w-full lg:w-40">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
            Role
          </span>
          <select
            className="input"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as "" | UserRole);
              setPage(1);
            }}
          >
            {ROLES.map((r) => (
              <option key={r || "all"} value={r}>
                {r ? r : "All roles"}
              </option>
            ))}
          </select>
        </label>
        <label className="w-full lg:w-52">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
            Status
          </span>
          <select
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "" | UserStatus);
              setPage(1);
            }}
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s.replace(/_/g, " ") : "All statuses"}
              </option>
            ))}
          </select>
        </label>
        <label className="w-full lg:w-44">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
            NIN
          </span>
          <select
            className="input"
            value={ninVerified}
            onChange={(e) => {
              setNinVerified(e.target.value as "" | "true" | "false");
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </label>
      </div>

      {isLoading && !data ? (
        <TableSkeleton rows={8} cols={7} />
      ) : (
        <>
          <div className={isFetching ? "opacity-70 transition" : ""}>
            <DataTable
              headers={["Name", "Email", "Role", "NIN", "Premium", "Status", "Joined"]}
              statusColumn={5}
              rows={(data?.users || []).map((u) => [
                u.name || "—",
                u.email,
                u.role,
                u.ninVerified ? "Yes" : "No",
                u.livenessVerified ? "Yes" : "No",
                u.status,
                u.createdAt ? formatDate(u.createdAt) : "—",
              ])}
            />
          </div>
          {data && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </AdminShell>
  );
}
