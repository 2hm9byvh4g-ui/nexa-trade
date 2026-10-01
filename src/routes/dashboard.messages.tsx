import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getThreadMessages, listMyThreads, sendMessage } from "@/lib/server/inbox";
import { useProfile } from "@/lib/use-profile";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/messages")({ component: MessagesPage });

function MessagesPage() {
  const { user } = useProfile();
  const qc = useQueryClient();
  const [active, setActive] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const threads = useQuery({ queryKey: ["threads"], queryFn: () => listMyThreads() });
  const detail = useQuery({
    queryKey: ["thread", active],
    queryFn: () => getThreadMessages({ data: active! }),
    enabled: active != null,
  });
  const send = useMutation({
    mutationFn: () => sendMessage({ data: { thread_id: active!, body } }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["thread", active] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-xl border border-border bg-surface">
        <h1 className="border-b border-border px-4 py-3 font-display text-xl text-cream">Messages</h1>
        <ul>
          {(threads.data ?? []).map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActive(t.id)}
                className={`w-full px-4 py-3 text-left text-sm ${active === t.id ? "bg-surface-2" : ""}`}
              >
                <p className="text-cream">{t.other_company ?? t.other_name}</p>
                <p className="line-clamp-1 text-xs text-muted">{t.last_body}</p>
              </button>
            </li>
          ))}
          {!threads.data?.length ? <p className="px-4 py-6 text-sm text-muted">No threads yet.</p> : null}
        </ul>
      </aside>
      <section className="flex min-h-[420px] flex-col rounded-xl border border-border bg-surface">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {(detail.data?.messages ?? []).map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.from_user_id === user?.id ? "ml-auto bg-primary/20 text-cream" : "bg-surface-2 text-fg"
              }`}
            >
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] text-subtle">{formatDate(m.created_at)}</p>
            </div>
          ))}
        </div>
        {active != null ? (
          <form
            className="border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send.mutate();
            }}
          >
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} required />
            <Button className="mt-2" type="submit" disabled={send.isPending}>
              Send
            </Button>
          </form>
        ) : (
          <p className="p-6 text-sm text-muted">Select a conversation.</p>
        )}
      </section>
    </div>
  );
}
