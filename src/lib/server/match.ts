import { num } from "@/lib/utils";
import type { BuyingRequest, MatchRow, Product } from "@/lib/types";

export function scoreMatch(request: BuyingRequest, product: Product): MatchRow | null {
  const q = request.product_name.toLowerCase();
  const name = product.name.toLowerCase();
  const sub = (product.subcategory ?? "").toLowerCase();
  const desc = (product.description ?? "").toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);

  let score = 0;
  const reasons: string[] = [];

  if (name.includes(q) || q.includes(name) || sub.includes(q) || q.includes(sub)) {
    score += 50;
    reasons.push("Product match");
  }
  for (const t of tokens) {
    if (name.includes(t) || sub.includes(t) || desc.includes(t)) {
      score += 8;
    }
  }
  if (request.category && product.category === request.category) {
    score += 16;
    reasons.push("Same category");
  }
  if (request.required_quality && product.grade) {
    const g = product.grade.toLowerCase();
    const need = request.required_quality.toLowerCase();
    if (g.includes(need) || need.includes(g) || (need.includes("export") && g.includes("export"))) {
      score += 14;
      reasons.push("Quality alignment");
    }
  }
  const avail = num(product.available_qty);
  const needQty = num(request.quantity);
  if (avail >= needQty) {
    score += 20;
    reasons.push("Full quantity available");
  } else if (avail >= needQty * 0.2) {
    score += 10;
    reasons.push("Partial quantity available");
  }
  if (request.packaging && product.packaging) {
    const pack = product.packaging.toLowerCase();
    const want = request.packaging.toLowerCase();
    const packHit =
      pack.includes(want.replace(/bags?/i, "").trim()) ||
      (pack.includes("25") && want.includes("25"));
    if (packHit) {
      score += 6;
      reasons.push("Packaging fit");
    }
  }
  if (product.verification_level === "export_ready") {
    score += 22;
    reasons.push("Export-ready supplier");
  } else if (product.product_verified) {
    score += 14;
    reasons.push("Product verified");
  } else if (product.business_verified) {
    score += 8;
    reasons.push("Business verified");
  } else if (product.identity_verified) {
    score += 4;
  }
  if (product.export_docs_status === "complete") {
    score += 8;
    reasons.push("Export docs on file");
  }

  if (score < 28) return null;
  return {
    ...product,
    score,
    reason: reasons.slice(0, 3).join(" · ") || "Related listing",
  };
}
