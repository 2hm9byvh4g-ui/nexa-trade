import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/public-shell";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerifyLadder, VerifyPills } from "@/components/verify-badges";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getPublicProfile } from "@/lib/server/profiles";
import { listSupplierProducts } from "@/lib/server/catalog";
import { fileReport } from "@/lib/server/admin";
import { startThread } from "@/lib/server/inbox";

export const Route = createFileRoute("/suppliers/$id")({ component: SupplierPage });

function SupplierPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const profile = useQuery({ queryKey: ["public-profile", id], queryFn: () => getPublicProfile({ data: id }) });
  const products = useQuery({ queryKey: ["supplier-products", id], queryFn: () => listSupplierProducts({ data: id }) });
  const [body, setBody] = useState("");
  const contact = useMutation({
    mutationFn: () =>
      startThread({
        data: { other_user_id: id, subject: profile.data?.company_name ?? "Enquiry", body: body || "Hello — we would like to discuss supply." },
      }),
    onSuccess: () => toast.success("Message sent"),
    onError: (e: Error) => toast.error(e.message),
  });
  const report = useMutation({
    mutationFn: () => fileReport({ data: { target_user_id: id, reason: "Suspicious account" } }),
    onSuccess: () => toast.success("Report filed"),
  });

  const s = profile.data;
  if (!s) {
    return (
      <PublicShell>
        <p className="px-4 py-20 text-center text-muted">Loading supplier…</p>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{s.business_type}</p>
        <h1 className="mt-2 font-display text-4xl text-cream">{s.company_name}</h1>
        <p className="mt-2 text-muted">
          {s.display_name} · {s.city}
          {s.state_region ? `, ${s.state_region}` : ""} · {s.country}
        </p>
        <div className="mt-4">
          <VerifyPills
            level={s.verification_level}
            identity={s.identity_verified}
            business={s.business_verified}
            product={s.product_verified}
            exportDocs={s.export_docs_status}
          />
        </div>
        <p className="mt-6 max-w-2xl text-muted">{s.bio}</p>
        <div className="mt-8">
          <VerifyLadder level={s.verification_level} />
        </div>
        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl text-cream">Contact</h2>
          <Textarea className="mt-3" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Introduce your requirement…" />
          {isPending ? null : user ? (
            <Button className="mt-3" onClick={() => contact.mutate()} disabled={contact.isPending}>
              Send message
            </Button>
          ) : (
            <Button asChild className="mt-3" variant="cream">
              <Link to="/login">Sign in to contact</Link>
            </Button>
          )}
          <button type="button" className="ml-4 text-xs text-subtle underline" onClick={() => report.mutate()}>
            Report supplier
          </button>
        </div>
        <h2 className="mt-12 font-display text-2xl text-cream">Listings</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products.data ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
