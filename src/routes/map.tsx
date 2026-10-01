import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { NigeriaSupplyMap } from "@/components/nigeria-map";

export const Route = createFileRoute("/map")({ component: MapPage });

function MapPage() {
  const navigate = useNavigate();
  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Origins</p>
        <h1 className="mt-2 font-display text-4xl text-cream">Nigerian supply map</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Where listed commodities concentrate. Pins are editorial, for orientation —
          not a cadastral or customs map.
        </p>
        <div className="mt-8">
          <NigeriaSupplyMap onSelect={() => navigate({ to: "/marketplace" })} />
        </div>
      </div>
    </PublicShell>
  );
}
