import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function num(value: number | string | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatUsd(value: number | string | null | undefined): string {
  const n = num(value);
  if (!n) return "On request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatUsdRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
): string {
  const a = num(min);
  const b = num(max);
  if (!a && !b) return "On request";
  if (a && b && a !== b) return `${formatUsd(a)} – ${formatUsd(b)}`;
  return formatUsd(a || b);
}

export function formatQty(
  value: number | string | null | undefined,
  unit = "tonnes",
): string {
  const n = num(value);
  if (!n) return "—";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n)} ${unit}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function parseJsonList(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function initials(name: string | null | undefined): string {
  if (!name) return "N";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "N";
}
