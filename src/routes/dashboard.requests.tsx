import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { listMyRequests, listRequestsForSupplier } from "@/lib/server/trade";
import { useProfile } from "@/lib/use-profile";
import { formatQty } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/requests")({ component: RequestsPage });

function RequestsPage() {
  const { profile } = useProfile();
  const mine = useQuery({ queryKey: ["my-requests"], queryFn: () => listMyRequests() });
  const inbound = useQuery({
    queryKey: ["supplier-inbound"],
    queryFn: () => listRequestsForSupplier(),
    enabled: profile?.role !== "buyer",
  });
  const supplier = profile?.role === "supplier" || profile?.role === "admin";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-cream">{supplier ? "Buyer requests" : "My RFQs"}</h1>
      {supplier ? (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {(inbound.data ?? []).map((row) => (
            <li key={row.request.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <Link to="/requests/$id" params={{ id: String(row.request.id) }} className="text-cream hover:underline">
                {row.request.product_name}
              </Link>
              <span className="text-sm text-muted">
                {formatQty(row.request.quantity)} · {row.request.destination_country} · score {row.score}
              </span>
            </li>
          ))}
          {!inbound.data?.length ? <p className="px-4 py-6 text-sm text-muted">No matched inbound requests.</p> : null}
        </ul>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {(mine.data ?? []).map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <Link to="/requests/$id" params={{ id: String(r.id) }} className="text-cream hover:underline">
                {r.product_name}
              </Link>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">{formatQty(r.quantity)}</span>
                <Badge variant="cream">{r.status}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
