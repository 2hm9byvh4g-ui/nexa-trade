import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function NexaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-primary", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M9 23V9h3.2l7.6 10.4V9H23v14h-3.2L12.2 12.6V23H9z"
        fill="#E6DCC8"
      />
      <path d="M7.5 25.5c6.5-1.8 11-1.8 17 0" stroke="#14201A" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

export function NexaWordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <NexaMark className="size-8" />
      <span className="flex flex-col justify-center">
        <span className="font-display text-lg leading-none tracking-tight text-cream">NEXA</span>
        <span className="mt-0.5 text-[9px] font-medium leading-none tracking-[0.28em] text-muted uppercase">
          Trade
        </span>
      </span>
    </Link>
  );
}
