import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useProfile } from "@/lib/use-profile";

export function RequireProfile({
  children,
  admin,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user, authPending, profile, profilePending } = useProfile();
  if (authPending || profilePending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg p-8">
        <Skeleton className="h-40 w-full max-w-lg" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!profile) return <Navigate to="/onboarding" />;
  if (admin && profile.role !== "admin") {
    return (
      <DashboardShell role={profile.role}>
        <p className="text-muted">This area is for NEXA operators.</p>
      </DashboardShell>
    );
  }
  return <DashboardShell role={profile.role}>{children}</DashboardShell>;
}
