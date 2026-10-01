import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  ShieldCheck,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import type { Role } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const SUPPLIER = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/products", label: "My products", icon: Package },
  { to: "/dashboard/requests", label: "Buyer requests", icon: ClipboardList },
  { to: "/dashboard/quotes", label: "Quotes", icon: ShoppingBag },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/documents", label: "Documents", icon: FileText },
  { to: "/dashboard/verification", label: "Verification", icon: ShieldCheck },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const BUYER = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/marketplace", label: "Find products", icon: Package },
  { to: "/dashboard/requests", label: "My RFQs", icon: ClipboardList },
  { to: "/dashboard/quotes", label: "Quotes received", icon: ShoppingBag },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/documents", label: "Documents", icon: FileText },
  { to: "/dashboard/verification", label: "Verification", icon: ShieldCheck },
];

const ADMIN = [
  { to: "/admin", label: "Admin", icon: ShieldCheck },
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
];

export function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = role === "admin" ? [...ADMIN, ...SUPPLIER] : role === "supplier" ? SUPPLIER : BUYER;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-56 shrink-0">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm whitespace-nowrap",
                    active ? "bg-surface-2 text-cream" : "text-muted hover:text-cream",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1 pb-16">{children}</div>
      </div>
    </div>
  );
}
