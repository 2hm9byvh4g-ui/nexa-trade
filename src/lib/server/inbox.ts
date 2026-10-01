import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Message, Thread } from "@/lib/types";

const CATALOG_REPLIES = [
  "Thank you for writing through NEXA. We can discuss quantity, packing, and Incoterms. Please share destination port and preferred inspection standard.",
  "We have export-grade stock available. Share your required moisture, packing, and whether you prefer FOB Lagos or CIF your port, and we will confirm.",
  "Received. Our team can prepare a proforma once destination, volume, and quality spec are confirmed. NEXA is the venue for this conversation — contracts still sit with the parties.",
];

export const listMyThreads = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<Thread>(
      `select t.id, t.buyer_user_id, t.supplier_user_id, t.product_id, t.request_id,
              t.subject, t.updated_at::text as updated_at, t.created_at::text as created_at,
              case when t.buyer_user_id = $1 then sp.display_name else bp.display_name end as other_name,
              case when t.buyer_user_id = $1 then sp.company_name else bp.company_name end as other_company,
              (select body from messages m where m.thread_id = t.id order by created_at desc limit 1) as last_body
       from threads t
       left join profiles bp on bp.user_id = t.buyer_user_id
       left join profiles sp on sp.user_id = t.supplier_user_id
       where t.buyer_user_id = $1 or t.supplier_user_id = $1
       order by t.updated_at desc`,
      [context.userId],
    );
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((threadId: number) => threadId)
  .handler(async ({ context, data: threadId }) => {
    const sql = await getSql();
    const thread = await sql.query<Thread>(
      `select id, buyer_user_id, supplier_user_id, product_id, request_id, subject,
              updated_at::text as updated_at, created_at::text as created_at
       from threads where id = $1`,
      [threadId],
    );
    const t = thread[0];
    if (!t) throw new Error("Thread not found");
    if (t.buyer_user_id !== context.userId && t.supplier_user_id !== context.userId) {
      throw new Error("Not allowed");
    }
    const messages = await sql.query<Message>(
      `select id, thread_id, from_user_id, to_user_id, body, created_at::text as created_at
       from messages where thread_id = $1 order by created_at asc`,
      [threadId],
    );
    return { thread: t, messages };
  });

export const startThread = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      other_user_id: string;
      product_id?: number;
      request_id?: number;
      subject?: string;
      body: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    if (!data.body.trim()) throw new Error("Message required");
    const sql = await getSql();
    const me = await sql.query<{ role: string }>(
      "select role from profiles where user_id = $1",
      [context.userId],
    );
    const other = await sql.query<{ role: string }>(
      "select role from profiles where user_id = $1",
      [data.other_user_id],
    );
    if (!other[0]) throw new Error("User not found");
    const myRole = me[0]?.role;
    const buyer = myRole === "supplier" ? data.other_user_id : context.userId;
    const supplier = myRole === "supplier" ? context.userId : data.other_user_id;

    const existing = await sql.query<{ id: number }>(
      `select id from threads
       where buyer_user_id = $1 and supplier_user_id = $2
         and coalesce(product_id,0) = coalesce($3,0)
         and coalesce(request_id,0) = coalesce($4,0)
       limit 1`,
      [buyer, supplier, data.product_id ?? null, data.request_id ?? null],
    );
    let threadId = existing[0]?.id;
    if (!threadId) {
      const inserted = await sql.query<{ id: number }>(
        `insert into threads (buyer_user_id, supplier_user_id, product_id, request_id, subject)
         values ($1,$2,$3,$4,$5) returning id`,
        [buyer, supplier, data.product_id ?? null, data.request_id ?? null, data.subject || "Trade enquiry"],
      );
      threadId = inserted[0].id;
    }
    await sql.query(
      `insert into messages (thread_id, from_user_id, to_user_id, body) values ($1,$2,$3,$4)`,
      [threadId, context.userId, data.other_user_id, data.body.trim()],
    );
    await sql.query("update threads set updated_at = now() where id = $1", [threadId]);

    if (data.other_user_id.startsWith("catalog-")) {
      const reply = CATALOG_REPLIES[threadId % CATALOG_REPLIES.length];
      await sql.query(
        `insert into messages (thread_id, from_user_id, to_user_id, body) values ($1,$2,$3,$4)`,
        [threadId, data.other_user_id, context.userId, reply],
      );
    }
    return { threadId };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { thread_id: number; body: string }) => input)
  .handler(async ({ context, data }) => {
    if (!data.body.trim()) throw new Error("Message required");
    const sql = await getSql();
    const thread = await sql.query<Thread>(
      "select id, buyer_user_id, supplier_user_id from threads where id = $1",
      [data.thread_id],
    );
    const t = thread[0];
    if (!t) throw new Error("Thread not found");
    if (t.buyer_user_id !== context.userId && t.supplier_user_id !== context.userId) {
      throw new Error("Not allowed");
    }
    const to = t.buyer_user_id === context.userId ? t.supplier_user_id : t.buyer_user_id;
    await sql.query(
      `insert into messages (thread_id, from_user_id, to_user_id, body) values ($1,$2,$3,$4)`,
      [data.thread_id, context.userId, to, data.body.trim()],
    );
    await sql.query("update threads set updated_at = now() where id = $1", [data.thread_id]);
    if (to.startsWith("catalog-")) {
      const reply = CATALOG_REPLIES[data.thread_id % CATALOG_REPLIES.length];
      await sql.query(
        `insert into messages (thread_id, from_user_id, to_user_id, body) values ($1,$2,$3,$4)`,
        [data.thread_id, to, context.userId, reply],
      );
    }
    return { ok: true as const };
  });
