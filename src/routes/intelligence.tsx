import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PublicShell } from "@/components/layout/public-shell";
import { SEASONAL_NOTES } from "@/lib/catalog";
import { getIntelligence } from "@/lib/server/intelligence";
import { formatUsd, num } from "@/lib/utils";

export const Route = createFileRoute("/intelligence")({ component: Intelligence });

function Intelligence() {
  const { data } = useQuery({ queryKey: ["intel"], queryFn: () => getIntelligence() });

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">NEXA Trade Intelligence</p>
        <h1 className="mt-2 font-display text-4xl text-cream">What the corridor is doing</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Built from platform activity — requests, listings and quotes — plus seasonal
          notes. This is not official export statistics. Treat figures as directional.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Approved listings" value={String(data?.liveListings ?? "—")} />
          <Stat label="Open demand" value={String(data?.openDemand ?? "—")} />
          <Stat label="Quotes on platform" value={String(data?.quoteCount ?? "—")} />
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Buyer destinations">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.byDest ?? []}>
                <CartesianGrid stroke="#2a3630" vertical={false} />
                <XAxis dataKey="destination_country" stroke="#8f9b93" fontSize={11} />
                <YAxis stroke="#8f9b93" fontSize={11} />
                <Tooltip contentStyle={{ background: "#171f1a", border: "1px solid #2a3630" }} />
                <Bar dataKey="n" fill="#2f8a58" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Requested products">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.byProduct ?? []}>
                <CartesianGrid stroke="#2a3630" vertical={false} />
                <XAxis dataKey="product_name" stroke="#8f9b93" fontSize={11} />
                <YAxis stroke="#8f9b93" fontSize={11} />
                <Tooltip contentStyle={{ background: "#171f1a", border: "1px solid #2a3630" }} />
                <Bar dataKey="n" fill="#e6dcc8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <h2 className="mt-12 font-display text-2xl text-cream">Seasonal supply notes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(SEASONAL_NOTES).map(([k, v]) => (
            <article key={k} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-medium text-cream">{k}</h3>
              <p className="mt-2 text-sm text-muted">{v}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-xs text-subtle">
          Indicative average quote on platform: {formatUsd(num(data?.avgQuote))}/t across mixed
          commodities — not a market index.
        </p>
      </div>
    </PublicShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums text-cream">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-4 font-display text-xl text-cream">{title}</h2>
      {children}
    </div>
  );
}
