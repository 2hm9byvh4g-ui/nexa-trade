import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getSupplierAnalytics } from "@/lib/server/intelligence";

export const Route = createFileRoute("/dashboard/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const { data } = useQuery({ queryKey: ["supplier-analytics"], queryFn: () => getSupplierAnalytics() });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-cream">Analytics</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Listing views" value={String(data?.views ?? 0)} />
        <Stat label="Quotes sent / received" value={String(data?.quotes ?? 0)} />
        <Stat label="Listings" value={String(data?.listings ?? 0)} />
      </div>
      <p className="text-sm text-muted">
        Corridor-wide demand lives on the{" "}
        <Link to="/intelligence" className="text-cream underline-offset-4 hover:underline">
          intelligence board
        </Link>
        .
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums text-cream">{value}</p>
    </div>
  );
}
