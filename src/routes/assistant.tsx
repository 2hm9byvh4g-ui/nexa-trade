import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { askTradeAssistant } from "@/lib/server/assistant";

export const Route = createFileRoute("/assistant")({ component: Assistant });

type Turn = { role: "user" | "assistant"; content: string };

function Assistant() {
  const { user, isPending } = useCurrentUserState();
  const [input, setInput] = useState("I want to buy 30 tonnes of Nigerian ginger.");
  const [messages, setMessages] = useState<Turn[]>([]);
  const ask = useMutation({
    mutationFn: (next: Turn[]) => askTradeAssistant({ data: { messages: next } }),
    onSuccess: (res, next) => {
      if (res.ok) setMessages([...next, { role: "assistant", content: res.text }]);
      else setMessages([...next, { role: "assistant", content: res.error }]);
    },
  });

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Assistant</p>
        <h1 className="mt-2 font-display text-4xl text-cream">Draft the RFQ. Learn the terms.</h1>
        <p className="mt-3 text-sm text-muted">
          For legal, customs, regulatory and banking questions, NEXA points you to qualified
          professionals and official authorities — it does not replace them.
        </p>
        <div className="mt-8 space-y-4">
          {messages.map((m, i) => (
            <article
              key={i}
              className={`rounded-xl border border-border p-4 text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-surface-2 text-fg" : "bg-surface text-muted"
              }`}
            >
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-subtle">
                {m.role === "user" ? "You" : "NEXA assistant"}
              </p>
              {m.content}
            </article>
          ))}
        </div>
        {isPending ? null : !user ? (
          <Button asChild className="mt-8" variant="cream">
            <Link to="/login">Sign in to use the assistant</Link>
          </Button>
        ) : (
          <form
            className="mt-8 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const next = [...messages, { role: "user" as const, content: input }];
              setMessages(next);
              setInput("");
              ask.mutate(next);
            }}
          >
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} required />
            <Button type="submit" disabled={ask.isPending}>
              {ask.isPending ? "Thinking…" : "Ask"}
            </Button>
          </form>
        )}
      </div>
    </PublicShell>
  );
}
