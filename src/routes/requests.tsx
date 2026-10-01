import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listOpenRequests } from "@/lib/server/trade";
import { formatQty } from "@/lib/utils";

export const Route = createFileRoute("/requests")({ component: Requests });

function Requests() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["open-requests", q],
    queryFn: () => listOpenRequests({ data: { q } }),
  });

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Demand board</p>
            <h1 className="mt-2 font-display text-4xl text-cream">Open buying requests</h1>
          </div>
          <Link to="/request" className="text-sm text-cream underline-offset-4 hover:underline">
            Post a request
          </Link>
        </div>
        <Input className="mt-6 max-w-md" placeholder="Filter by product or country" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {(data ?? []).map((r) => (
            <Link
              key={r.id}
              to="/requests/$id"
              params={{ id: String(r.id) }}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-surface-2"
            >
              <div>
                <p className="font-medium text-cream">{r.product_name}</p>
                <p className="text-sm text-muted">
                  {r.company_name} · {r.destination_city}, {r.destination_country}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="tabular-nums">{formatQty(r.quantity, r.qty_unit)}</span>
                <Badge variant={r.status === "matched" ? "green" : "cream"}>{r.status}</Badge>
                <span className="text-muted">{r.match_count} matches</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
