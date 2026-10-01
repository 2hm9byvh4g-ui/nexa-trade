import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CATEGORIES, DESTINATIONS, GRADES, INCOTERMS, PACKAGING } from "@/lib/catalog";
import { createBuyingRequest } from "@/lib/server/trade";

export const Route = createFileRoute("/request")({ component: PostRequest });

function PostRequest() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("50");
  const [city, setCity] = useState("Qingdao");
  const [country, setCountry] = useState("China");
  const [quality, setQuality] = useState("Export grade");
  const [packaging, setPackaging] = useState("25kg bags");
  const [delivery, setDelivery] = useState("CIF");
  const [deadline, setDeadline] = useState("30");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createBuyingRequest({
        data: {
          product_name: product,
          category: category || undefined,
          quantity: Number(quantity),
          destination_city: city,
          destination_country: country,
          required_quality: quality,
          packaging,
          delivery_terms: delivery,
          deadline_days: Number(deadline),
          notes,
        },
      }),
    onSuccess: (r) => {
      toast.success(`${r.matchCount} Nigerian suppliers matched`);
      navigate({ to: "/requests/$id", params: { id: String(r.id) } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Demand</p>
        <h1 className="mt-2 font-display text-4xl text-cream">I want to buy</h1>
        <p className="mt-3 text-muted">
          Tell Nigeria what you need. Matching suppliers are ranked on quantity, origin,
          quality, documents and verification — not on who paid for a badge.
        </p>
        <form
          className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!user) {
              navigate({ to: "/login" });
              return;
            }
            mutation.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Product</Label>
              <Input required placeholder="Dried ginger" value={product} onChange={(e) => setProduct(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Any</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantity (tonnes)</Label>
              <Input required type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Destination city</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Destination country</Label>
              <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                {DESTINATIONS.map((d) => (
                  <option key={d.country + d.city} value={d.country}>
                    {d.country}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Required quality</Label>
              <Select value={quality} onChange={(e) => setQuality(e.target.value)}>
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Packaging</Label>
              <Select value={packaging} onChange={(e) => setPackaging(e.target.value)}>
                {PACKAGING.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Delivery</Label>
              <Select value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                {INCOTERMS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Deadline (days)</Label>
              <Input type="number" min={7} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Spec, inspection, monthly programme…" />
            </div>
          </div>
          <Button type="submit" className="w-full" variant="cream" disabled={mutation.isPending || isPending}>
            {user ? (mutation.isPending ? "Matching suppliers…" : "Post buying request") : "Sign in to post"}
          </Button>
          {!user && !isPending ? (
            <p className="text-center text-sm text-muted">
              <Link to="/register" className="text-cream underline-offset-4 hover:underline">
                Create a buyer account
              </Link>
            </p>
          ) : null}
        </form>
      </div>
    </PublicShell>
  );
}
