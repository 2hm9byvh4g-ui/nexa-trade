import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { NexaWordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isPending && user) return <Navigate to="/onboarding" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    setBusy(false);
    if (err) {
      setError(err.message ?? "Could not sign in");
      return;
    }
    navigate({ to: "/onboarding" });
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <NexaWordmark />
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Welcome back</p>
          <h1 className="mt-2 font-display text-3xl text-cream">Sign in to NEXA</h1>
          <p className="mt-2 text-sm text-muted">
            International buyers and Nigerian suppliers use the same door.
          </p>
        </div>
        {authEnabled ? (
          <div className="space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/onboarding" })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-subtle">
          <span className="h-px flex-1 bg-border" />
          Email
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={onEmail} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in with email"}
          </Button>
        </form>
        <p className="text-sm text-muted">
          New to NEXA?{" "}
          <Link to="/register" className="text-cream underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
