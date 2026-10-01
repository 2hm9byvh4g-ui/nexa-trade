import { useState } from "react";
import { NIGERIAN_STATES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function NigeriaSupplyMap({
  onSelect,
  active,
}: {
  onSelect?: (name: string) => void;
  active?: string | null;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const selected = NIGERIAN_STATES.find((s) => s.name === (hover || active));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
        <svg viewBox="0 0 100 100" className="h-auto w-full text-primary">
          <path
            d="M28 18C36 10 48 8 58 9C68 10 78 14 84 22C89 28 91 36 90 44C90 52 92 58 90 66C87 76 78 84 68 87C58 90 50 91 42 88C32 84 24 78 19 68C14 58 13 48 14 40C15 30 20 23 28 18Z"
            fill="#1e2822"
            stroke="#2f8a58"
            strokeWidth="0.8"
          />
          <path
            d="M22 72C28 78 36 84 48 86C54 84 50 80 44 76C36 72 28 70 22 72Z"
            fill="#0f1612"
            opacity="0.55"
          />
          {NIGERIAN_STATES.map((s) => (
            <g key={s.id}>
              <circle
                cx={s.x}
                cy={s.y}
                r={active === s.name || hover === s.name ? 2.4 : 1.6}
                className={cn(
                  "cursor-pointer transition-all duration-150",
                  active === s.name ? "fill-cream" : "fill-primary",
                )}
                onMouseEnter={() => setHover(s.name)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect?.(s.name)}
              />
              <text
                x={s.x + 2.2}
                y={s.y + 0.8}
                className="fill-muted"
                fontSize="2.6"
                fontFamily="Figtree, sans-serif"
              >
                {s.name}
              </text>
            </g>
          ))}
        </svg>
        <p className="mt-3 text-xs text-subtle">
          Schematic supply atlas — pins mark states with listed commodities, not a cadastral map.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Selected origin</p>
        <h3 className="mt-2 font-display text-2xl text-cream">
          {selected?.name ?? "Nigeria"}
        </h3>
        <p className="text-sm text-muted">{selected?.region ?? "National overview"}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {(selected?.products ?? ["Hibiscus", "Sesame", "Ginger", "Cocoa"]).map((p) => (
            <li
              key={p}
              className="rounded-full border border-border px-3 py-1 text-xs text-cream"
            >
              {p}
            </li>
          ))}
        </ul>
        {onSelect && selected ? (
          <button
            type="button"
            className="mt-6 text-sm text-cream underline-offset-4 hover:underline"
            onClick={() => onSelect(selected.name)}
          >
            View listings from {selected.name}
          </button>
        ) : null}
      </div>
    </div>
  );
}
