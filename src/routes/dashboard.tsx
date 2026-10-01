import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireProfile } from "@/components/require-profile";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireProfile>
      <Outlet />
    </RequireProfile>
  ),
});
