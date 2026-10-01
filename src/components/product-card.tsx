import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { productImage } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { formatQty, formatUsdRange } from "@/lib/utils";
import { VerifyPills } from "./verify-badges";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/marketplace/$productId"
      params={{ productId: String(product.id) }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <img
          src={productImage(product.image_key)}
          alt={product.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant="cream">{product.subcategory ?? product.category}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg text-cream">{product.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3.5" />
            {product.origin_city ? `${product.origin_city}, ` : ""}
            {product.origin_state ?? "Nigeria"}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-subtle">Available</dt>
            <dd className="tabular-nums text-fg">{formatQty(product.available_qty, product.qty_unit)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-subtle">MOQ</dt>
            <dd className="tabular-nums text-fg">{formatQty(product.moq, product.qty_unit)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-subtle">Indicative</dt>
            <dd className="tabular-nums text-fg">{formatUsdRange(product.price_min, product.price_max)}/t</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-subtle">Terms</dt>
            <dd className="text-fg">{product.incoterms ?? "Negotiable"}</dd>
          </div>
        </dl>
        <div className="mt-auto">
          <p className="mb-2 text-xs text-muted">{product.company_name ?? product.supplier_name}</p>
          <VerifyPills
            compact
            level={product.verification_level}
            identity={product.identity_verified}
            business={product.business_verified}
            product={product.product_verified}
            exportDocs={product.export_docs_status}
          />
        </div>
      </div>
    </Link>
  );
}
