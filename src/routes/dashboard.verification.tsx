import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { VerifyLadder } from "@/components/verify-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { listMyVerification, submitVerification } from "@/lib/server/profiles";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/dashboard/verification")({ component: VerificationPage });

function VerificationPage() {
  const { profile } = useProfile();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-verifications"], queryFn: () => listMyVerification() });
  const [level, setLevel] = useState("identity");
  const [notes, setNotes] = useState("");
  const submit = useMutation({
    mutationFn: () => submitVerification({ data: { level, document_notes: notes } }),
    onSuccess: () => {
      toast.success("Submitted for operator review");
      setNotes("");
      qc.invalidateQueries({ queryKey: ["my-verifications"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-cream">Verification</h1>
      <p className="text-sm text-muted">
        Trust is staged. A subscription never skips identity, business, product or export-ready
        review. Operators inspect what you describe here.
      </p>
      <VerifyLadder level={profile?.verification_level} />
      <form
        className="space-y-3 rounded-xl border border-border bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
      >
        <Select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="identity">Identity documents</option>
          <option value="business">Business registration</option>
          <option value="product">Product / packing evidence</option>
          <option value="export">Export documentation pathway</option>
        </Select>
        <Textarea
          required
          placeholder="Describe what you are submitting (ID type, CAC number, packing photos, inspection booking…)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button type="submit" disabled={submit.isPending}>
          Request review
        </Button>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((v) => (
          <li key={String(v.id)} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm">
            <span>
              {String(v.level)} · {String(v.document_notes)}
            </span>
            <Badge variant={v.status === "approved" ? "green" : v.status === "rejected" ? "danger" : "warn"}>
              {String(v.status)}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
