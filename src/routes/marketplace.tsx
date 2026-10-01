import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/catalog";
import { listProducts } from "@/lib/server/catalog";

export const Route = createFileRoute("/marketplace")({ component: Marketplace });

function Marketplace() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const { data, isPending } = useQuery({
    queryKey: ["products", q, category, state],
    queryFn: () => listProducts({ data: { q, category: category || undefined, state: state || undefined } }),
  });
  const states = useMemo(() => {
    const set = new Set((data ?? []).map((p) => p.origin_state).filter(Boolean) as string[]);
    return [...set].sort();
  }, [data]);

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Discover</p>
        <h1 className="mt-2 font-display text-4xl text-cream">Nigerian supply</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Approved listings from producers, processors and exporters. Indicative prices are
          starting points for negotiation, not a live exchange.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Input placeholder="Search ginger, sesame, hibiscus…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">All origins</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id === category ? "" : c.id)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                category === c.id ? "border-primary text-cream" : "border-border text-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {isPending ? (
          <p className="mt-10 text-sm text-muted">Loading listings…</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {!isPending && !data?.length ? (
          <p className="mt-10 text-sm text-muted">
            No approved listings for that filter.{" "}
            <Link to="/request" className="text-cream underline-offset-4 hover:underline">
              Post a buying request
            </Link>{" "}
            instead.
          </p>
        ) : null}
      </div>
    </PublicShell>
  );
}
