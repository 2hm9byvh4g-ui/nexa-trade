import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const SYSTEM = `You are the NEXA Trade assistant. NEXA is a B2B platform connecting verified Nigerian suppliers with international buyers.

Help with:
- Drafting buying requests (RFQs) for Nigerian products
- Explaining Incoterms, quotation format, and typical export documents at a high level
- Matching language: ginger, hibiscus, sesame, shea, cashew, cocoa, gum arabic, chili, grains
- Asking clarifying questions: destination, quality, packing, Incoterm, deadline, quantity

Rules:
- Never present legal, customs, tax, regulatory, or financial advice as fact. Direct users to licensed professionals and official authorities (Nigeria Customs, plant quarantine, authorised chambers, banks).
- NEXA organises the workflow; it does not issue government certificates or replace licensed inspectors, freight forwarders, or banks.
- Prices on the platform are indicative and negotiable.
- Be concise, professional, and concrete. If you draft an RFQ, output a compact structured block the user can post.
- Do not invent live market prices or claim a specific shipment exists unless the user provided it.`;

type ChatTurn = { role: "user" | "assistant"; content: string };

export const askTradeAssistant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { messages: ChatTurn[] }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false as const,
        error: "The trade assistant is not available in this environment.",
      };
    }
    const trimmed = data.messages.slice(-12).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 4000),
    }));
    if (!trimmed.length) return { ok: false as const, error: "Ask a question first." };

    const sql = await getSql();
    const sample = await sql.query<{ name: string; origin_state: string | null; available_qty: string }>(
      `select name, origin_state, available_qty::text as available_qty
       from products where status = 'approved' order by view_count desc limit 8`,
    );
    const catalogNote = sample
      .map((p) => `${p.name} (${p.origin_state ?? "Nigeria"}, ${p.available_qty} t listed)`)
      .join("; ");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 700,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "system",
            content: `Current approved listings snapshot (indicative, not a live exchange): ${catalogNote || "none"}.`,
          },
          ...trimmed,
        ],
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: `Assistant error (${res.status}). Try again.` };
    }
    const body = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });
