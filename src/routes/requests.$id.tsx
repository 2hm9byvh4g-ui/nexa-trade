import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/public-shell";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VerifyPills } from "@/components/verify-badges";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createQuote, getRequest, listQuotesForRequest, setQuoteStatus } from "@/lib/server/trade";
import { useProfile } from "@/lib/use-profile";
import { formatQty, formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/requests/$id")({ component: RequestDetail });

function RequestDetail() {
  const { id } = Route.useParams();
  const requestId = Number(id);
  const qc = useQueryClient();
  const { user } = useCurrentUserState();
  const { profile } = useProfile();
  const detail = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => getRequest({ data: requestId }),
  });
  const quotes = useQuery({
    queryKey: ["request-quotes", requestId],
    queryFn: () => listQuotesForRequest({ data: requestId }),
  });
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");

  const sendQuote = useMutation({
    mutationFn: () =>
      createQuote({
        data: {
          request_id: requestId,
          buyer_user_id: detail.data!.request.user_id,
          quantity: Number(qty) || Number(detail.data!.request.quantity),
          price_per_unit: Number(price),
          incoterms: detail.data!.request.delivery_terms ?? "FOB",
          notes,
        },
      }),
    onSuccess: () => {
      toast.success("Quote sent");
      qc.invalidateQueries({ queryKey: ["request-quotes", requestId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const decide = useMutation({
    mutationFn: (input: { id: number; status: "accepted" | "declined" }) => setQuoteStatus({ data: input }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["request-quotes", requestId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bundle = detail.data;
  if (!bundle) {
    return (
      <PublicShell>
        <p className="px-4 py-20 text-center text-muted">Loading request…</p>
      </PublicShell>
    );
  }
  const { request, matches } = bundle;
  const isBuyer = user?.id === request.user_id;
  const isSupplier = profile?.role === "supplier";

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Buying request</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl text-cream">{request.product_name}</h1>
          <Badge variant="cream">{request.status}</Badge>
        </div>
        <p className="mt-2 text-muted">
          {request.company_name} · {request.destination_city}, {request.destination_country} ·{" "}
          {formatQty(request.quantity, request.qty_unit)} · {request.delivery_terms} · {request.deadline_days} days
        </p>
        {request.notes ? <p className="mt-4 max-w-3xl text-sm text-muted">{request.notes}</p> : null}

        <h2 className="mt-12 font-display text-2xl text-cream">Matched Nigerian suppliers</h2>
        <p className="mt-2 text-sm text-muted">{matches.length} listings crossed the matching threshold.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <div key={m.id} className="relative">
              <ProductCard product={m} />
              <p className="mt-2 text-xs text-subtle">
                Score {m.score} · {m.reason}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl text-cream">Quotes</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Price / t</th>
                <th className="px-4 py-3">Terms</th>
                <th className="px-4 py-3">Status</th>
                {isBuyer ? <th className="px-4 py-3" /> : null}
              </tr>
            </thead>
            <tbody>
              {(quotes.data ?? []).map((q) => (
                <tr key={q.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link to="/suppliers/$id" params={{ id: q.supplier_user_id }} className="text-cream hover:underline">
                      {q.supplier_company}
                    </Link>
                    <div className="mt-1">
                      <VerifyPills compact level={q.verification_level} />
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatQty(q.quantity)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatUsd(q.price_per_unit)}</td>
                  <td className="px-4 py-3">{q.incoterms}</td>
                  <td className="px-4 py-3">{q.status}</td>
                  {isBuyer && q.status === "pending" ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => decide.mutate({ id: q.id, status: "accepted" })}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: q.id, status: "declined" })}>
                          Decline
                        </Button>
                      </div>
                    </td>
                  ) : isBuyer ? (
                    <td />
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isSupplier ? (
          <form
            className="mt-8 grid gap-3 rounded-xl border border-border bg-surface p-5 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendQuote.mutate();
            }}
          >
            <Input placeholder="Quantity" value={qty} onChange={(e) => setQty(e.target.value)} />
            <Input placeholder="USD / tonne" required value={price} onChange={(e) => setPrice(e.target.value)} />
            <Button type="submit" disabled={sendQuote.isPending}>
              Send quote
            </Button>
            <Textarea className="sm:col-span-3" placeholder="Validity, packing, inspection…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </form>
        ) : null}
      </div>
    </PublicShell>
  );
}
