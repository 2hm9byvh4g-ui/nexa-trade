import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireProfile } from "@/components/require-profile";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RequireProfile admin>
      <Outlet />
    </RequireProfile>
  ),
});
