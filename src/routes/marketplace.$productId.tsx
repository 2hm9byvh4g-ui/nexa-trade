import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerifyPills } from "@/components/verify-badges";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { productImage } from "@/lib/catalog";
import { getProduct, incrementProductView, toggleSavedProduct } from "@/lib/server/catalog";
import { fileReport } from "@/lib/server/admin";
import { startThread } from "@/lib/server/inbox";
import { requestQuoteOnProduct } from "@/lib/server/trade";
import { formatQty, formatUsdRange, parseJsonList } from "@/lib/utils";

export const Route = createFileRoute("/marketplace/$productId")({ component: ProductPage });

function ProductPage() {
  const { productId } = Route.useParams();
  const id = Number(productId);
  const qc = useQueryClient();
  const { user, isPending } = useCurrentUserState();
  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct({ data: id }),
  });
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState("");

  useEffect(() => {
    if (Number.isFinite(id)) void incrementProductView({ data: id });
  }, [id]);

  const quote = useMutation({
    mutationFn: () =>
      requestQuoteOnProduct({
        data: { product_id: id, quantity: qty ? Number(qty) : undefined, notes: message || undefined },
      }),
    onSuccess: () => {
      toast.success("Quotation requested");
      qc.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const contact = useMutation({
    mutationFn: () =>
      startThread({
        data: {
          other_user_id: product!.user_id,
          product_id: id,
          subject: product?.name,
          body: message || `Enquiry on ${product?.name}`,
        },
      }),
    onSuccess: () => toast.success("Message sent — open Messages in your workspace"),
    onError: (e: Error) => toast.error(e.message),
  });
  const save = useMutation({
    mutationFn: () => toggleSavedProduct({ data: id }),
    onSuccess: (r) => toast.success(r.saved ? "Saved" : "Removed from saved"),
  });
  const report = useMutation({
    mutationFn: () =>
      fileReport({
        data: { target_product_id: id, target_user_id: product?.user_id, reason: "Suspicious listing" },
      }),
    onSuccess: () => toast.success("Report filed for operator review"),
  });

  if (!product) {
    return (
      <PublicShell>
        <p className="px-4 py-20 text-center text-muted">Loading listing…</p>
      </PublicShell>
    );
  }

  const certs = parseJsonList(product.certificates);
  const signedOut = !isPending && !user;

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={productImage(product.image_key)} alt={product.name} className="aspect-[4/3] w-full object-cover" />
          </div>
          <h1 className="mt-6 font-display text-4xl text-cream">{product.name}</h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-4" />
            {product.origin_city ? `${product.origin_city}, ` : ""}
            {product.origin_state}, Nigeria
          </p>
          <p className="mt-4 text-muted">{product.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Stat label="Available" value={formatQty(product.available_qty, product.qty_unit)} />
            <Stat label="MOQ" value={formatQty(product.moq, product.qty_unit)} />
            <Stat label="Grade" value={product.grade ?? "—"} />
            <Stat label="Packaging" value={product.packaging ?? "—"} />
            <Stat label="Indicative" value={`${formatUsdRange(product.price_min, product.price_max)} / t`} />
            <Stat label="Incoterms" value={product.incoterms ?? "Negotiable"} />
            <Stat label="Season" value={product.harvest_season ?? "—"} />
            <Stat label="HS code" value={product.hs_code ?? "—"} />
            <Stat label="Views" value={String(product.view_count)} />
          </dl>
          {certs.length ? (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.16em] text-subtle">Documents flagged</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {certs.map((c) => (
                  <li key={c} className="rounded-full border border-border px-3 py-1 text-xs text-cream">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Supplier</p>
            <Link
              to="/suppliers/$id"
              params={{ id: product.user_id }}
              className="mt-2 block font-display text-2xl text-cream hover:underline"
            >
              {product.company_name}
            </Link>
            <p className="text-sm text-muted">{product.supplier_name}</p>
            <div className="mt-4">
              <VerifyPills
                level={product.verification_level}
                identity={product.identity_verified}
                business={product.business_verified}
                product={product.product_verified}
                exportDocs={product.export_docs_status}
              />
            </div>
            <Textarea
              className="mt-4"
              placeholder="Quantity, destination, packing notes…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <input
              className="mt-3 flex h-11 w-full rounded-md border border-input bg-bg px-3 text-sm"
              placeholder="Quantity (tonnes)"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            {signedOut ? (
              <Button asChild className="mt-4 w-full" variant="cream">
                <Link to="/login">Sign in to request a quote</Link>
              </Button>
            ) : (
              <div className="mt-4 grid gap-2">
                <Button onClick={() => quote.mutate()} disabled={quote.isPending}>
                  Request quote
                </Button>
                <Button variant="secondary" onClick={() => contact.mutate()} disabled={contact.isPending}>
                  Contact supplier
                </Button>
                <Button variant="outline" onClick={() => save.mutate()}>
                  Save product
                </Button>
              </div>
            )}
            <button
              type="button"
              className="mt-4 text-xs text-subtle underline-offset-4 hover:underline"
              onClick={() => report.mutate()}
            >
              Report this listing
            </button>
          </div>
          <p className="text-xs text-subtle">
            NEXA does not escrow funds or issue phytosanitary certificates. Use licensed
            inspection, banking and logistics partners for the physical trade.
          </p>
        </aside>
      </div>
    </PublicShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <dt className="text-[11px] uppercase tracking-wider text-subtle">{label}</dt>
      <dd className="mt-1 tabular-nums text-fg">{value}</dd>
    </div>
  );
}
