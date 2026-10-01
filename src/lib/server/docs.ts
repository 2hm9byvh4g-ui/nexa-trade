import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { TradeDocument } from "@/lib/types";

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<TradeDocument>(
      `select id, user_id, order_id, doc_type, title, notes, status, created_at::text as created_at
       from documents where user_id = $1 order by created_at desc`,
      [context.userId],
    );
  });

export const addDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { order_id?: number; doc_type: string; title: string; notes?: string }) => input)
  .handler(async ({ context, data }) => {
    if (!data.title.trim()) throw new Error("Title required");
    const sql = await getSql();
    await sql.query(
      `insert into documents (user_id, order_id, doc_type, title, notes) values ($1,$2,$3,$4,$5)`,
      [
        context.userId,
        data.order_id ?? null,
        data.doc_type,
        data.title.trim(),
        data.notes?.trim() || null,
      ],
    );
    return { ok: true as const };
  });

export const setDocumentStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: TradeDocument["status"] }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query("update documents set status = $1 where id = $2 and user_id = $3", [
      data.status,
      data.id,
      context.userId,
    ]);
    return { ok: true as const };
  });
