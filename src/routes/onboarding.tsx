import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Globe2, Leaf, Shield } from "lucide-react";
import { useState, type FormEvent } from "react";
import { NexaWordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { BUSINESS_TYPES_BUYER, BUSINESS_TYPES_SUPPLIER, type Role } from "@/lib/catalog";
import { upsertMyProfile } from "@/lib/server/profiles";
import { useProfile } from "@/lib/use-profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  const { user, authPending, profile, profilePending } = useProfile();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("buyer");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [operator, setOperator] = useState(false);

  if (authPending || profilePending) {
    return (
      <main className="grid min-h-dvh place-items-center p-8">
        <Skeleton className="h-64 w-full max-w-lg" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (profile) return <Navigate to="/dashboard" />;

  const types = role === "supplier" ? BUSINESS_TYPES_SUPPLIER : BUSINESS_TYPES_BUYER;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await upsertMyProfile({
        data: {
          role: operator ? "admin" : role,
          display_name: name || user?.displayName || "Member",
          company_name: company,
          country: country || (role === "supplier" ? "Nigeria" : undefined),
          phone,
          business_type: businessType,
          city,
          state_region: stateRegion,
        },
      });
      navigate({ to: operator ? "/admin" : "/dashboard" });
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <NexaWordmark />
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Complete profile</p>
        <h1 className="mt-2 font-display text-4xl text-cream">How will you use NEXA?</h1>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("supplier")}
          className={cn(
            "rounded-xl border p-4 text-left",
            role === "supplier" && !operator ? "border-primary bg-primary/10" : "border-border bg-surface",
          )}
        >
          <Leaf className="size-5 text-primary" />
          <p className="mt-3 font-medium text-cream">Supplier / exporter</p>
        </button>
        <button
          type="button"
          onClick={() => {
            setRole("buyer");
            setOperator(false);
          }}
          className={cn(
            "rounded-xl border p-4 text-left",
            role === "buyer" && !operator ? "border-primary bg-primary/10" : "border-border bg-surface",
          )}
        >
          <Globe2 className="size-5 text-primary" />
          <p className="mt-3 font-medium text-cream">International buyer</p>
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder={user.displayName ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input required value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input required value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{role === "supplier" ? "Nigerian state" : "Phone"}</Label>
            {role === "supplier" ? (
              <Input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="Kaduna" />
            ) : (
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Business type</Label>
            <Select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
              <option value="">Select</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={operator}
            onChange={(e) => setOperator(e.target.checked)}
            className="size-4 accent-primary"
          />
          I am joining as a NEXA operator (admin review)
        </label>
        <p className="flex gap-2 text-xs text-subtle">
          <Shield className="size-3.5 shrink-0" />
          Operator seats are limited. Product and supplier badges still require review.
        </p>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Saving…" : "Enter NEXA"}
        </Button>
      </form>
    </main>
  );
}
