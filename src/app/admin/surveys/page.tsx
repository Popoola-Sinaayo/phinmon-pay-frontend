"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { AdminShell } from "@/components/layout/AdminShell";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminSurveysPage() {
  const { data: surveys, isLoading } = useQuery({
    queryKey: ["admin-surveys"],
    queryFn: async () => (await api.get("/admin/surveys")).data.surveys,
  });

  return (
    <AdminShell title="Projects" subtitle="All research projects across the platform" backHref="/admin">
      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : (
        <DataTable
          headers={["Title", "Status", "Responses", "Needed", "Cost"]}
          statusColumn={1}
          rows={(surveys || []).map(
            (s: {
              title: string;
              status: string;
              responsesReceived: number;
              responsesNeeded: number;
              totalCost: number;
            }) => [
              s.title,
              s.status,
              s.responsesReceived,
              s.responsesNeeded,
              `\u20a6${s.totalCost.toLocaleString()}`,
            ]
          )}
        />
      )}
    </AdminShell>
  );
}
