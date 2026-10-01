import { Link } from "@tanstack/react-router";
import { NexaWordmark } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <NexaWordmark />
          <p className="mt-4 max-w-md text-sm text-muted">
            A B2B digital trade platform connecting verified Nigerian supply with
            international demand. Verify, match, transact, track.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link to="/marketplace" className="hover:text-cream">Marketplace</Link></li>
            <li><Link to="/request" className="hover:text-cream">Post a buying request</Link></li>
            <li><Link to="/intelligence" className="hover:text-cream">Export intelligence</Link></li>
            <li><Link to="/assistant" className="hover:text-cream">Trade assistant</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">Notes</p>
          <p className="mt-3 text-sm text-muted">
            NEXA organises discovery, verification, matching and documentation.
            It does not replace Nigeria Customs, plant quarantine, licensed
            inspectors, banks or freight forwarders.
          </p>
        </div>
      </div>
    </footer>
  );
}
