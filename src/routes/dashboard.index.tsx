import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { VerifyLadder } from "@/components/verify-badges";
import { Button } from "@/components/ui/button";
import { listMyProducts } from "@/lib/server/catalog";
import { listMyQuotes, listMyOrders, listMyRequests, listRequestsForSupplier } from "@/lib/server/trade";
import { listMyThreads } from "@/lib/server/inbox";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const { profile } = useProfile();
  const products = useQuery({ queryKey: ["my-products"], queryFn: () => listMyProducts() });
  const quotes = useQuery({ queryKey: ["quotes"], queryFn: () => listMyQuotes() });
  const orders = useQuery({ queryKey: ["orders"], queryFn: () => listMyOrders() });
  const requests = useQuery({ queryKey: ["my-requests"], queryFn: () => listMyRequests() });
  const inbound = useQuery({
    queryKey: ["supplier-inbound"],
    queryFn: () => listRequestsForSupplier(),
    enabled: profile?.role === "supplier" || profile?.role === "admin",
  });
  const threads = useQuery({ queryKey: ["threads"], queryFn: () => listMyThreads() });

  if (!profile) return null;
  const supplier = profile.role === "supplier" || profile.role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
          {profile.role} workspace
        </p>
        <h1 className="mt-2 font-display text-3xl text-cream">{profile.company_name ?? profile.display_name}</h1>
        <p className="mt-1 text-sm text-muted">{profile.display_name}</p>
      </div>
      <VerifyLadder level={profile.verification_level} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Quotes" value={String(quotes.data?.length ?? 0)} />
        <Stat label="Orders" value={String(orders.data?.length ?? 0)} />
        <Stat label="Messages" value={String(threads.data?.length ?? 0)} />
      </div>
      {supplier ? (
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-cream">Buyer requests that match you</h2>
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/products">List a product</Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {(inbound.data ?? []).slice(0, 5).map((row) => (
              <li key={row.request.id} className="flex items-center justify-between gap-3 text-sm">
                <Link to="/requests/$id" params={{ id: String(row.request.id) }} className="text-cream hover:underline">
                  {row.request.product_name} · {row.request.destination_country}
                </Link>
                <span className="text-muted">score {row.score}</span>
              </li>
            ))}
            {!inbound.data?.length ? <p className="text-sm text-muted">No matching open requests yet.</p> : null}
          </ul>
        </section>
      ) : (
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-cream">Your RFQs</h2>
            <Button asChild size="sm" variant="cream">
              <Link to="/request">I want to buy</Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {(requests.data ?? []).map((r) => (
              <li key={r.id}>
                <Link to="/requests/$id" params={{ id: String(r.id) }} className="text-sm text-cream hover:underline">
                  {r.product_name} · {r.status} · {r.match_count} matches
                </Link>
              </li>
            ))}
            {!requests.data?.length ? <p className="text-sm text-muted">Post a buying request to start matching.</p> : null}
          </ul>
        </section>
      )}
      {supplier ? (
        <p className="text-sm text-muted">{products.data?.length ?? 0} of your listings are on file.</p>
      ) : null}
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
