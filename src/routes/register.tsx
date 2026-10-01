import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Globe2, Leaf, Shield } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { NexaWordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BUSINESS_TYPES_BUYER, BUSINESS_TYPES_SUPPLIER, type Role } from "@/lib/catalog";
import { authClient } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { upsertMyProfile } from "@/lib/server/profiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("buyer");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState(role === "supplier" ? "Nigeria" : "");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isPending && user) return <Navigate to="/onboarding" />;

  const types = role === "supplier" ? BUSINESS_TYPES_SUPPLIER : BUSINESS_TYPES_BUYER;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.signUp.email({ email, password, name });
    if (err) {
      setBusy(false);
      setError(err.message ?? "Could not create the account");
      return;
    }
    try {
      await upsertMyProfile({
        data: {
          role,
          display_name: name,
          company_name: company,
          country: country || (role === "supplier" ? "Nigeria" : undefined),
          phone,
          business_type: businessType,
        },
      });
      navigate({ to: "/dashboard" });
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Account created — finish your profile next.");
      navigate({ to: "/onboarding" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">
      <div className="space-y-6">
        <NexaWordmark />
        <h1 className="font-display text-4xl text-cream">Join the corridor</h1>
        <p className="max-w-md text-muted">
          Register as a Nigerian supplier or an international buyer. Verification is earned —
          never purchased as a shortcut to trust.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setRole("supplier");
              setCountry("Nigeria");
            }}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              role === "supplier" ? "border-primary bg-primary/10" : "border-border bg-surface",
            )}
          >
            <Leaf className="size-5 text-primary" />
            <p className="mt-3 font-medium text-cream">Supplier / exporter</p>
            <p className="mt-1 text-xs text-muted">Nigeria-based producers, processors, co-ops.</p>
          </button>
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              role === "buyer" ? "border-primary bg-primary/10" : "border-border bg-surface",
            )}
          >
            <Globe2 className="size-5 text-primary" />
            <p className="mt-3 font-medium text-cream">International buyer</p>
            <p className="mt-1 text-xs text-muted">Importers sourcing Nigerian supply.</p>
          </button>
        </div>
        <p className="flex items-start gap-2 text-xs text-subtle">
          <Shield className="mt-0.5 size-3.5 shrink-0" />
          Paying for a subscription never grants a verified badge. Operators review identity,
          business and product evidence separately.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Company">
            <Input required value={company} onChange={(e) => setCompany(e.target.value)} />
          </Field>
          <Field label="Country">
            <Input required value={country} onChange={(e) => setCountry(e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Business type" className="sm:col-span-2">
            <Select required value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
              <option value="">Select</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-sm text-muted">
          Already registered?{" "}
          <Link to="/login" className="text-cream underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
