import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { NexaWordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/request", label: "I want to buy" },
  { to: "/requests", label: "Demand" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/map", label: "Supply map" },
  { to: "/intelligence", label: "Intelligence" },
  { to: "/assistant", label: "Assistant" },
];

function NavLinks({ onClick, pathname }: { onClick?: () => void; pathname: string }) {
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClick}
          className={cn(
            "text-sm text-muted transition-colors hover:text-cream",
            pathname.startsWith(item.to) && "text-cream",
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <Skeleton className="h-11 w-28" />;
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="cream">
          <Link to="/dashboard">Workspace</Link>
        </Button>
        <UserButton />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="ghost">
        <Link to="/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="cream">
        <Link to="/register">Join NEXA</Link>
      </Button>
    </div>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <NexaWordmark />
        <nav className="hidden items-center gap-5 lg:flex">
          <NavLinks pathname={pathname} />
        </nav>
        <div className="hidden lg:block">
          <AuthSlot />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="gap-6 pt-14">
            <nav className="flex flex-col gap-4">
              <NavLinks pathname={pathname} onClick={() => setOpen(false)} />
            </nav>
            <AuthSlot />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
