import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminDecideVerification,
  adminListProducts,
  adminListReports,
  adminListRequests,
  adminListUsers,
  adminListVerifications,
  adminSetProductStatus,
  adminSetReportStatus,
  getAdminOverview,
} from "@/lib/server/admin";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const qc = useQueryClient();
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => getAdminOverview() });
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => adminListUsers() });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => adminListProducts() });
  const verifications = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: () => adminListVerifications(),
  });
  const requests = useQuery({ queryKey: ["admin-requests"], queryFn: () => adminListRequests() });
  const reports = useQuery({ queryKey: ["admin-reports"], queryFn: () => adminListReports() });

  const setProduct = useMutation({
    mutationFn: (input: { id: number; status: "approved" | "rejected" | "pending" }) =>
      adminSetProductStatus({ data: input }),
    onSuccess: () => {
      toast.success("Product updated");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
  const decide = useMutation({
    mutationFn: (input: { id: number; status: "approved" | "rejected" }) =>
      adminDecideVerification({ data: input }),
    onSuccess: () => {
      toast.success("Verification updated");
      qc.invalidateQueries({ queryKey: ["admin-verifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const report = useMutation({
    mutationFn: (input: { id: number; status: "reviewing" | "resolved" | "dismissed" }) =>
      adminSetReportStatus({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] }),
  });

  const o = overview.data;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Operator</p>
        <h1 className="mt-2 font-display text-3xl text-cream">NEXA control</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(o?.users ?? []).map((u) => (
          <Mini key={u.role} label={u.role} value={u.n} />
        ))}
      </div>
      <Tabs defaultValue="products">
        <TabsList className="flex-wrap">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="verify">Verification</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {(products.data ?? []).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-cream">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.company_name} · {p.origin_state} · {p.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  {p.status !== "approved" ? (
                    <Button size="sm" onClick={() => setProduct.mutate({ id: p.id, status: "approved" })}>
                      Approve
                    </Button>
                  ) : null}
                  {p.status !== "rejected" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProduct.mutate({ id: p.id, status: "rejected" })}
                    >
                      Reject
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="verify">
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {(verifications.data ?? []).map((v) => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-cream">
                    {v.company_name} · {v.level}
                  </p>
                  <p className="text-xs text-muted">{v.document_notes}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={v.status === "pending" ? "warn" : "green"}>{v.status}</Badge>
                  {v.status === "pending" ? (
                    <>
                      <Button size="sm" onClick={() => decide.mutate({ id: v.id, status: "approved" })}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => decide.mutate({ id: v.id, status: "rejected" })}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="users">
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {(users.data ?? []).map((u) => (
              <div key={u.user_id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="text-cream">{u.company_name ?? u.display_name}</p>
                  <p className="text-xs text-muted">
                    {u.role} · {u.country} · {u.verification_level}
                  </p>
                </div>
                <Badge variant="outline">{u.user_id.startsWith("catalog-") ? "catalog" : "member"}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="requests">
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {(requests.data ?? []).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-cream">{r.product_name}</span>
                <span className="text-muted">
                  {r.destination_country} · {r.status}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reports">
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {(reports.data ?? []).map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="text-cream">{r.reason}</p>
                  <p className="text-xs text-muted">
                    {r.target_user_id ?? r.target_product_id} · {r.status}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => report.mutate({ id: r.id, status: "resolved" })}>
                  Resolve
                </Button>
              </div>
            ))}
            {!reports.data?.length ? <p className="px-4 py-6 text-sm text-muted">No fraud reports.</p> : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums text-cream">{value}</p>
    </div>
  );
}
