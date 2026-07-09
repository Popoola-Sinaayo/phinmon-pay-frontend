"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { DataTable } from "@/components/DataTable";
import Link from "next/link";

export default function AdminSurveysPage() {
  const { data: surveys } = useQuery({
    queryKey: ["admin-surveys"],
    queryFn: async () => (await api.get("/admin/surveys")).data.surveys,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/admin" />
      <main className="mx-auto max-w-dashboard p-6">
        <Link href="/admin" className="text-sm text-primary-600">← Admin</Link>
        <h1 className="mt-4 text-2xl font-bold">Projects</h1>
        <div className="mt-6">
          <DataTable
            headers={["Title", "Status", "Responses", "Needed", "Cost"]}
            rows={(surveys || []).map((s: { title: string; status: string; responsesReceived: number; responsesNeeded: number; totalCost: number }) => [
              s.title,
              s.status,
              s.responsesReceived,
              s.responsesNeeded,
              `₦${s.totalCost.toLocaleString()}`,
            ])}
          />
        </div>
      </main>
    </div>
  );
}
