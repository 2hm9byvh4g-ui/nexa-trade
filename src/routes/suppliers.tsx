import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { Input } from "@/components/ui/input";
import { VerifyPills } from "@/components/verify-badges";
import { listSuppliers } from "@/lib/server/catalog";

export const Route = createFileRoute("/suppliers")({ component: Suppliers });

function Suppliers() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["suppliers", q],
    queryFn: () => listSuppliers({ data: { q } }),
  });

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-4xl text-cream">Verified Nigerian suppliers</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Badges reflect the review stage completed — identity, business, product, export
          documentation — not a paid sticker.
        </p>
        <Input className="mt-6 max-w-md" placeholder="Search company or state" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(data ?? []).map((s) => (
            <Link
              key={s.user_id}
              to="/suppliers/$id"
              params={{ id: s.user_id }}
              className="rounded-xl border border-border bg-surface p-5 hover:border-primary/40"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-muted">{s.business_type}</p>
              <h2 className="mt-1 font-display text-2xl text-cream">{s.company_name}</h2>
              <p className="text-sm text-muted">
                {s.city}
                {s.state_region ? `, ${s.state_region}` : ""} · {s.country}
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-muted">{s.bio}</p>
              <div className="mt-4">
                <VerifyPills
                  level={s.verification_level}
                  identity={s.identity_verified}
                  business={s.business_verified}
                  product={s.product_verified}
                  exportDocs={s.export_docs_status}
                />
              </div>
              <p className="mt-3 text-xs text-subtle">
                {s.product_count} listings{s.sample_products ? ` · ${s.sample_products}` : ""}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
