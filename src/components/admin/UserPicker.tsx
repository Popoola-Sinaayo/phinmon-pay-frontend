"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

export function UserPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-email-user-picker", search],
    queryFn: async () => {
      const res = await api.get("/admin/users", {
        params: { page: 1, limit: 50, ...(search ? { q: search } : {}) },
      });
      return res.data.users as User[];
    },
  });

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500/60" />
        <input
          className="input pl-9"
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <p className="text-sm text-ink-600">
        <strong className="text-ink-900">{selectedIds.length}</strong> user(s) selected
      </p>

      <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-ink-500">Loading users…</p>
        ) : !data?.length ? (
          <p className="px-4 py-8 text-center text-sm text-ink-500">No users found.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.map((user) => {
              const checked = selectedIds.includes(user.id);
              return (
                <li key={user.id}>
                  <label className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-white">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() => toggle(user.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900">
                        {user.name || "—"}
                      </span>
                      <span className="block truncate text-xs text-ink-500">{user.email}</span>
                      <span className="mt-1 inline-flex gap-2 text-[11px] text-ink-400">
                        <span>{user.role}</span>
                        <span>·</span>
                        <span>{user.status.replace(/_/g, " ")}</span>
                        {user.createdAt && (
                          <>
                            <span>·</span>
                            <span>Joined {formatDate(user.createdAt)}</span>
                          </>
                        )}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
