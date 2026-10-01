import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMyQuotes, setQuoteStatus } from "@/lib/server/trade";
import { useProfile } from "@/lib/use-profile";
import { formatUsd, formatQty } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/quotes")({ component: QuotesPage });

function QuotesPage() {
  const { profile } = useProfile();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["quotes"], queryFn: () => listMyQuotes() });
  const decide = useMutation({
    mutationFn: (input: { id: number; status: "accepted" | "declined" | "withdrawn" }) =>
      setQuoteStatus({ data: input }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-cream">Quotes</h1>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-subtle">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Counterparty</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((q) => (
              <tr key={q.id} className="border-t border-border">
                <td className="px-4 py-3 text-cream">{q.product_name ?? q.request_product ?? "—"}</td>
                <td className="px-4 py-3">
                  {profile?.role === "buyer" ? q.supplier_company : q.buyer_company}
                </td>
                <td className="px-4 py-3 tabular-nums">{formatQty(q.quantity)}</td>
                <td className="px-4 py-3 tabular-nums">{formatUsd(q.price_per_unit)}</td>
                <td className="px-4 py-3">
                  <Badge variant={q.status === "accepted" ? "green" : "outline"}>{q.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {q.status === "pending" && profile?.role === "buyer" ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => decide.mutate({ id: q.id, status: "accepted" })}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: q.id, status: "declined" })}>
                        Decline
                      </Button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
