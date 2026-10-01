import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMyOrders, setOrderStatus } from "@/lib/server/trade";
import type { Order } from "@/lib/types";
import { formatUsd, formatQty, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/orders")({ component: OrdersPage });

const NEXT: Record<string, Order["status"][]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "disputed"],
  shipped: ["completed", "disputed"],
  completed: [],
  disputed: ["processing"],
  cancelled: [],
};

function OrdersPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["orders"], queryFn: () => listMyOrders() });
  const mutate = useMutation({
    mutationFn: (input: { id: number; status: Order["status"] }) => setOrderStatus({ data: input }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-cream">Orders</h1>
      <p className="text-sm text-muted">
        Status tracking only. Settlement still happens through regulated payment providers.
        NEXA may take a service fee on completed trades once commercial terms are set.
      </p>
      <div className="space-y-3">
        {(data ?? []).map((o) => (
          <article key={o.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-cream">{o.product_name ?? `Order #${o.id}`}</p>
                <p className="text-xs text-muted">
                  {o.buyer_company} → {o.supplier_company} · {formatDate(o.created_at)}
                </p>
              </div>
              <Badge variant={o.status === "disputed" ? "danger" : "cream"}>{o.status}</Badge>
            </div>
            <p className="mt-3 text-sm tabular-nums text-muted">
              {formatQty(o.quantity)} · {formatUsd(o.unit_price)} / t · {o.incoterms}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(NEXT[o.status] ?? []).map((s) => (
                <Button key={s} size="sm" variant="outline" onClick={() => mutate.mutate({ id: o.id, status: s })}>
                  Mark {s}
                </Button>
              ))}
            </div>
          </article>
        ))}
        {!data?.length ? <p className="text-sm text-muted">No orders yet. Accept a quote to open one.</p> : null}
      </div>
    </div>
  );
}
