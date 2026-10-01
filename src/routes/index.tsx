import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Radio } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { listOpenRequests } from "@/lib/server/trade";
import { listProducts } from "@/lib/server/catalog";
import { formatQty } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = [
  {
    k: "01",
    title: "Verify",
    body: "Identity, business, product, then export-ready. Badges show exactly what was reviewed — never a paid shortcut.",
  },
  {
    k: "02",
    title: "Match",
    body: "Buyers say what they need. NEXA alerts relevant Nigerian suppliers and ranks quantity, origin, quality and documents.",
  },
  {
    k: "03",
    title: "Transact",
    body: "Request quotes, negotiate in-platform, and move a trade into an order without leaving the corridor.",
  },
  {
    k: "04",
    title: "Track",
    body: "Orders, document checklists and status sit in one place. Government certificates still come from the proper authorities.",
  },
];

function Home() {
  const products = useQuery({ queryKey: ["home-products"], queryFn: () => listProducts({ data: {} }) });
  const demand = useQuery({ queryKey: ["home-demand"], queryFn: () => listOpenRequests({ data: {} }) });
  const featured = (products.data ?? []).slice(0, 6);
  const rfqs = (demand.data ?? []).slice(0, 3);

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/products/hero.jpg" alt="" className="size-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/75 to-bg" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-cream">
            Nigeria → Global
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.08] text-cream sm:text-6xl">
            From Nigerian supply to global demand.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted sm:text-lg">
            NEXA Trade is a B2B corridor for verified farmers, processors and exporters
            — and the international buyers who need what Nigeria can ship.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="cream">
              <Link to="/request">
                I want to buy
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/marketplace">Browse Nigerian supply</Link>
            </Button>
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.22em] text-subtle">
            Verify · Match · Transact · Track
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {STEPS.map((step) => (
            <article key={step.k} className="rounded-xl border border-border bg-surface p-5">
              <p className="font-mono text-xs text-primary">{step.k}</p>
              <h2 className="mt-3 font-display text-2xl text-cream">{step.title}</h2>
              <p className="mt-3 text-sm text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Live demand</p>
            <h2 className="mt-2 font-display text-3xl text-cream">Buyers are already asking</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/requests">All requests</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {rfqs.map((r) => (
            <Link
              key={r.id}
              to="/requests/$id"
              params={{ id: String(r.id) }}
              className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2 text-xs text-primary">
                <Radio className="size-3.5" />
                {r.destination_city}, {r.destination_country}
              </div>
              <h3 className="mt-3 font-display text-xl text-cream">{r.product_name}</h3>
              <p className="mt-2 text-sm text-muted">
                {formatQty(r.quantity, r.qty_unit)} · {r.required_quality} · {r.delivery_terms}
              </p>
              <p className="mt-4 text-xs text-subtle">{r.match_count} supplier matches</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Pilot catalog</p>
            <h2 className="mt-2 font-display text-3xl text-cream">What Nigeria can supply</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/marketplace">Marketplace</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl text-cream sm:text-4xl">
                Demand-driven, not a dump of listings.
              </h2>
              <p className="mt-4 text-muted">
                Tell Nigeria what you need. Verified suppliers respond with quantity,
                origin, packing and documents. Compare them on facts — then negotiate.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-fg">
                {[
                  "Pilot corridor: Nigeria → China, with room to grow",
                  "Layered verification instead of a generic tick",
                  "Document centre that organises — not impersonates — official process",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-bg p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Example request</p>
              <p className="mt-3 font-display text-2xl text-cream">50 tonnes dried ginger</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-subtle">Destination</dt>
                  <dd>Shanghai</dd>
                </div>
                <div>
                  <dt className="text-subtle">Quality</dt>
                  <dd>Export grade</dd>
                </div>
                <div>
                  <dt className="text-subtle">Packing</dt>
                  <dd>25kg bags</dd>
                </div>
                <div>
                  <dt className="text-subtle">Delivery</dt>
                  <dd>CIF · 30 days</dd>
                </div>
              </dl>
              <Button asChild className="mt-6 w-full" variant="cream">
                <Link to="/request">Post this kind of request</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
