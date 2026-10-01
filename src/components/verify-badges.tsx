import { Badge } from "@/components/ui/badge";
import type { VerificationLevel } from "@/lib/catalog";
import { VERIFICATION_STEPS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const ORDER: VerificationLevel[] = [
  "registered",
  "identity",
  "business",
  "product",
  "export_ready",
];

function reached(current: VerificationLevel | undefined, step: VerificationLevel) {
  return ORDER.indexOf(current ?? "registered") >= ORDER.indexOf(step);
}

export function VerifyPills({
  level,
  identity,
  business,
  product,
  exportDocs,
  compact,
}: {
  level?: VerificationLevel;
  identity?: boolean;
  business?: boolean;
  product?: boolean;
  exportDocs?: string | null;
  compact?: boolean;
}) {
  const items = [
    { on: Boolean(identity) || reached(level, "identity"), label: "Identity" },
    { on: Boolean(business) || reached(level, "business"), label: "Business" },
    { on: Boolean(product) || reached(level, "product"), label: "Product" },
    {
      on: exportDocs === "complete" || reached(level, "export_ready"),
      pending: exportDocs === "pending",
      label: "Export docs",
    },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge
          key={item.label}
          variant={item.on ? "green" : item.pending ? "warn" : "outline"}
          className={cn(compact && "text-[10px] px-2")}
        >
          {item.on ? "Verified · " : item.pending ? "Pending · " : ""}
          {item.label}
        </Badge>
      ))}
    </div>
  );
}

export function VerifyLadder({ level }: { level?: VerificationLevel }) {
  const current = level ?? "registered";
  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {VERIFICATION_STEPS.map((step, i) => {
        const on = reached(current, step.id);
        return (
          <li
            key={step.id}
            className={cn(
              "rounded-lg border p-3",
              on ? "border-primary/40 bg-primary/10" : "border-border bg-surface-2",
            )}
          >
            <p className="text-[10px] tracking-[0.16em] uppercase text-muted">0{i + 1}</p>
            <p className={cn("mt-1 text-sm font-medium", on ? "text-cream" : "text-muted")}>
              {step.label}
            </p>
            <p className="mt-1 text-xs text-subtle">{step.hint}</p>
          </li>
        );
      })}
    </ol>
  );
}
