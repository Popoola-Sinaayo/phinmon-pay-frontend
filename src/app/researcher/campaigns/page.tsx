"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CampaignRow } from "@/components/Cards";
import { EmptyState } from "@/components/EmptyState";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StaggerList, StaggerItem } from "@/components/motion";
import type { Survey } from "@/types";

export default function CampaignsPage() {
  const { user, isLoading } = useRequireAuth("researcher");

  const { data: surveys, isLoading: loadingSurveys } = useQuery({
    queryKey: ["my-surveys"],
    queryFn: async () => {
      const { data } = await api.get<{ surveys: Survey[] }>("/surveys/mine");
      return data.surveys;
    },
    enabled: !!user,
  });

  return (
    <DashboardShell
      user={user}
      title="Projects"
      subtitle="Manage your research projects and track response progress"
      loading={isLoading || loadingSurveys}
      actions={
        <Link href="/researcher/campaigns/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New Project
        </Link>
      }
    >
      {!loadingSurveys && (
        <>
          {surveys?.length ? (
            <StaggerList className="space-y-4">
              {surveys.map((s, i) => (
                <StaggerItem key={s._id}>
                  <CampaignRow survey={s} index={i} />
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <EmptyState
              title="No projects yet"
              description="Create your first research project to start collecting insights."
              actionLabel="Create Project"
              actionHref="/researcher/campaigns/new"
            />
          )}
        </>
      )}
    </DashboardShell>
  );
}
