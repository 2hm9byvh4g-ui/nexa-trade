import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, GRADES, INCOTERMS, NIGERIAN_STATES, PACKAGING } from "@/lib/catalog";
import { createProduct, listMyProducts } from "@/lib/server/catalog";
import { formatQty } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/products")({ component: MyProducts });

function MyProducts() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-products"], queryFn: () => listMyProducts() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "spices-botanicals",
    subcategory: "",
    description: "",
    origin_state: "Kaduna",
    origin_city: "",
    available_qty: "20",
    moq: "5",
    grade: "Export grade",
    packaging: "25kg bags",
    price_min: "",
    price_max: "",
    incoterms: "FOB",
    certificates: "",
    harvest_season: "",
    image_key: "ginger",
  });
  const create = useMutation({
    mutationFn: () =>
      createProduct({
        data: {
          ...form,
          available_qty: Number(form.available_qty) || undefined,
          moq: Number(form.moq) || undefined,
          price_min: form.price_min ? Number(form.price_min) : undefined,
          price_max: form.price_max ? Number(form.price_max) : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Listing submitted for operator review");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["my-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-cream">My products</h1>
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "New listing"}</Button>
      </div>
      {open ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Field label="Name" className="sm:col-span-2">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Commodity">
            <Input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
          </Field>
          <Field label="State">
            <Select value={form.origin_state} onChange={(e) => setForm({ ...form, origin_state: e.target.value })}>
              {NIGERIAN_STATES.map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="City">
            <Input value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })} />
          </Field>
          <Field label="Available tonnes">
            <Input value={form.available_qty} onChange={(e) => setForm({ ...form, available_qty: e.target.value })} />
          </Field>
          <Field label="MOQ">
            <Input value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} />
          </Field>
          <Field label="Grade">
            <Select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              {GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="Packaging">
            <Select value={form.packaging} onChange={(e) => setForm({ ...form, packaging: e.target.value })}>
              {PACKAGING.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="Price min USD/t">
            <Input value={form.price_min} onChange={(e) => setForm({ ...form, price_min: e.target.value })} />
          </Field>
          <Field label="Price max USD/t">
            <Input value={form.price_max} onChange={(e) => setForm({ ...form, price_max: e.target.value })} />
          </Field>
          <Field label="Incoterms">
            <Select value={form.incoterms} onChange={(e) => setForm({ ...form, incoterms: e.target.value })}>
              {INCOTERMS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="Image key">
            <Select value={form.image_key} onChange={(e) => setForm({ ...form, image_key: e.target.value })}>
              {["ginger", "hibiscus", "sesame", "shea", "cashew", "cocoa", "gum-arabic", "chili", "groundnut"].map(
                (k) => (
                  <option key={k}>{k}</option>
                ),
              )}
            </Select>
          </Field>
          <Field label="Certificates (comma separated)" className="sm:col-span-2">
            <Input value={form.certificates} onChange={(e) => setForm({ ...form, certificates: e.target.value })} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Button type="submit" className="sm:col-span-2" disabled={create.isPending}>
            Submit for review
          </Button>
        </form>
      ) : null}
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {(data ?? []).map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <Link to="/marketplace/$productId" params={{ productId: String(p.id) }} className="text-cream hover:underline">
                {p.name}
              </Link>
              <p className="text-xs text-muted">
                {formatQty(p.available_qty, p.qty_unit)} · {p.origin_state}
              </p>
            </div>
            <Badge variant={p.status === "approved" ? "green" : p.status === "rejected" ? "danger" : "warn"}>
              {p.status}
            </Badge>
          </div>
        ))}
        {!data?.length ? <p className="px-4 py-6 text-sm text-muted">No listings yet.</p> : null}
      </div>
    </div>
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
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
