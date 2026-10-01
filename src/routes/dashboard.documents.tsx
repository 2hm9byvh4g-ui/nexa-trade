import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DOC_TYPES } from "@/lib/catalog";
import { addDocument, listMyDocuments, setDocumentStatus } from "@/lib/server/docs";

export const Route = createFileRoute("/dashboard/documents")({ component: DocsPage });

function DocsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["docs"], queryFn: () => listMyDocuments() });
  const [docType, setDocType] = useState<string>(DOC_TYPES[0].id);
  const [title, setTitle] = useState("");
  const add = useMutation({
    mutationFn: () => addDocument({ data: { doc_type: docType, title } }),
    onSuccess: () => {
      toast.success("Added to checklist");
      setTitle("");
      qc.invalidateQueries({ queryKey: ["docs"] });
    },
  });
  const status = useMutation({
    mutationFn: (input: { id: number; status: "draft" | "uploaded" | "verified" }) =>
      setDocumentStatus({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["docs"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-cream">Document centre</h1>
      <p className="text-sm text-muted">
        NEXA helps you organise export paperwork. Certificates of origin, phytosanitary
        certificates and customs entries are issued by the proper authorities and licensed
        professionals — not by this platform.
      </p>
      <form
        className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
          {DOC_TYPES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </Select>
        <Input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button type="submit">Add</Button>
      </form>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {(data ?? []).map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-cream">{d.title}</p>
              <p className="text-xs text-muted">{d.doc_type}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={d.status === "verified" ? "green" : "outline"}>{d.status}</Badge>
              {d.status !== "uploaded" ? (
                <Button size="sm" variant="outline" onClick={() => status.mutate({ id: d.id, status: "uploaded" })}>
                  Mark uploaded
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => status.mutate({ id: d.id, status: "verified" })}>
                  Mark checked
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
