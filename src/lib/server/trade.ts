import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { scoreMatch } from "@/lib/server/match";
import type { BuyingRequest, MatchRow, Order, Product, Quote } from "@/lib/types";
import { num } from "@/lib/utils";

const REQUEST_COLS = `
  r.id, r.user_id, r.product_name, r.category, r.quantity, r.qty_unit,
  r.destination_city, r.destination_country, r.required_quality, r.packaging,
  r.delivery_terms, r.deadline_days, r.notes, r.status, r.match_count,
  r.created_at::text as created_at,
  pr.company_name, pr.display_name as buyer_name, pr.country
`;

const PRODUCT_JOIN = `
  p.id, p.user_id, p.name, p.category, p.subcategory, p.description,
  p.origin_state, p.origin_city, p.available_qty, p.qty_unit, p.moq, p.grade,
  p.packaging, p.price_min, p.price_max, p.currency, p.incoterms, p.certificates,
  p.hs_code, p.status, p.harvest_season, p.image_key, p.view_count,
  p.created_at::text as created_at,
  pr.company_name, pr.display_name as supplier_name, pr.verification_level,
  pr.identity_verified, pr.business_verified, pr.product_verified,
  pr.export_docs_status, pr.country
`;

async function loadMatches(request: BuyingRequest): Promise<MatchRow[]> {
  const sql = await getSql();
  const products = await sql.query<Product>(
    `select ${PRODUCT_JOIN}
     from products p
     join profiles pr on pr.user_id = p.user_id
     where p.status = 'approved'`,
  );
  return products
    .map((p) => scoreMatch(request, p))
    .filter((m): m is MatchRow => Boolean(m))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

export const listOpenRequests = createServerFn({ method: "GET" })
  .validator((input: { q?: string } = {}) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const params: unknown[] = [];
    let extra = "";
    if (data.q?.trim()) {
      params.push(`%${data.q.trim()}%`);
      extra = `and (r.product_name ilike $1 or r.destination_country ilike $1)`;
    }
    return sql.query<BuyingRequest>(
      `select ${REQUEST_COLS}
       from buying_requests r
       join profiles pr on pr.user_id = r.user_id
       where r.status in ('open', 'matched') ${extra}
       order by r.created_at desc`,
      params,
    );
  });

export const getRequest = createServerFn({ method: "GET" })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    const rows = await sql.query<BuyingRequest>(
      `select ${REQUEST_COLS}
       from buying_requests r
       join profiles pr on pr.user_id = r.user_id
       where r.id = $1`,
      [id],
    );
    const request = rows[0];
    if (!request) return null;
    const matches = await loadMatches(request);
    return { request, matches };
  });

export type RequestInput = {
  product_name: string;
  category?: string;
  quantity: number;
  qty_unit?: string;
  destination_city?: string;
  destination_country?: string;
  required_quality?: string;
  packaging?: string;
  delivery_terms?: string;
  deadline_days?: number;
  notes?: string;
};

export const createBuyingRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: RequestInput) => input)
  .handler(async ({ context, data }) => {
    if (!data.product_name.trim()) throw new Error("Product is required");
    if (!data.quantity || data.quantity <= 0) throw new Error("Quantity is required");
    const sql = await getSql();
    const profile = await sql.query<{ role: string }>(
      "select role from profiles where user_id = $1",
      [context.userId],
    );
    if (!profile[0]) throw new Error("Complete your profile first");
    if (profile[0].role === "supplier") {
      throw new Error("Switch to a buyer account to post buying requests");
    }
    const inserted = await sql.query<{ id: number }>(
      `insert into buying_requests (
        user_id, product_name, category, quantity, qty_unit, destination_city,
        destination_country, required_quality, packaging, delivery_terms,
        deadline_days, notes
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      returning id`,
      [
        context.userId,
        data.product_name.trim(),
        data.category || null,
        data.quantity,
        data.qty_unit || "tonnes",
        data.destination_city?.trim() || null,
        data.destination_country?.trim() || null,
        data.required_quality || null,
        data.packaging || null,
        data.delivery_terms || null,
        data.deadline_days ?? 30,
        data.notes?.trim() || null,
      ],
    );
    const id = inserted[0].id;
    const loaded = await sql.query<BuyingRequest>(
      `select ${REQUEST_COLS} from buying_requests r join profiles pr on pr.user_id = r.user_id where r.id = $1`,
      [id],
    );
    const request = loaded[0];
    const matches = await loadMatches(request);
    await sql.query("update buying_requests set match_count = $1, status = $2 where id = $3", [
      matches.length,
      matches.length ? "matched" : "open",
      id,
    ]);

    const catalogMatches = matches.filter((m) => m.user_id.startsWith("catalog-")).slice(0, 4);
    for (const m of catalogMatches) {
      const mid = (num(m.price_min) + num(m.price_max)) / 2;
      const price = mid ? Math.round(mid * (0.96 + (m.id % 5) * 0.015)) : null;
      const qty = Math.min(num(m.available_qty) || data.quantity, data.quantity);
      await sql.query(
        `insert into quotes (
          request_id, product_id, supplier_user_id, buyer_user_id, quantity,
          price_per_unit, incoterms, validity_days, notes
        ) values ($1,$2,$3,$4,$5,$6,$7,14,$8)`,
        [
          id,
          m.id,
          m.user_id,
          context.userId,
          qty,
          price,
          data.delivery_terms || m.incoterms || "FOB",
          `Matched listing: ${m.name}. ${m.reason}. Indicative only — subject to inspection and contract.`,
        ],
      );
    }
    return { id, matchCount: matches.length };
  });

export const listMyRequests = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<BuyingRequest>(
      `select ${REQUEST_COLS}
       from buying_requests r
       join profiles pr on pr.user_id = r.user_id
       where r.user_id = $1
       order by r.created_at desc`,
      [context.userId],
    );
  });

export const listRequestsForSupplier = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const mine = await sql.query<Product>(
      `select ${PRODUCT_JOIN}
       from products p join profiles pr on pr.user_id = p.user_id
       where p.user_id = $1 and p.status = 'approved'`,
      [context.userId],
    );
    const open = await sql.query<BuyingRequest>(
      `select ${REQUEST_COLS}
       from buying_requests r
       join profiles pr on pr.user_id = r.user_id
       where r.status in ('open','matched')
       order by r.created_at desc`,
    );
    const scored = open
      .map((req) => {
        const best = mine
          .map((p) => scoreMatch(req, p))
          .filter((m): m is MatchRow => Boolean(m))
          .sort((a, b) => b.score - a.score)[0];
        return best ? { request: req, score: best.score, productName: best.name } : null;
      })
      .filter(Boolean);
    return scored as { request: BuyingRequest; score: number; productName: string }[];
  });

export type QuoteInput = {
  request_id?: number;
  product_id?: number;
  buyer_user_id: string;
  quantity: number;
  price_per_unit: number;
  incoterms?: string;
  validity_days?: number;
  notes?: string;
};

export const createQuote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: QuoteInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await sql.query<{ role: string }>(
      "select role from profiles where user_id = $1",
      [context.userId],
    );
    if (profile[0]?.role !== "supplier" && profile[0]?.role !== "admin") {
      throw new Error("Only suppliers can send quotes");
    }
    if (!data.price_per_unit) throw new Error("Price is required");
    await sql.query(
      `insert into quotes (
        request_id, product_id, supplier_user_id, buyer_user_id, quantity,
        price_per_unit, incoterms, validity_days, notes
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        data.request_id ?? null,
        data.product_id ?? null,
        context.userId,
        data.buyer_user_id,
        data.quantity,
        data.price_per_unit,
        data.incoterms || "FOB",
        data.validity_days ?? 14,
        data.notes?.trim() || null,
      ],
    );
    return { ok: true as const };
  });

export const requestQuoteOnProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { product_id: number; quantity?: number; notes?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const product = await sql.query<Product>(
      `select ${PRODUCT_JOIN} from products p join profiles pr on pr.user_id = p.user_id where p.id = $1`,
      [data.product_id],
    );
    const p = product[0];
    if (!p) throw new Error("Product not found");
    if (p.user_id === context.userId) throw new Error("You cannot quote your own listing");
    const qty = data.quantity || num(p.moq) || 1;
    const mid = (num(p.price_min) + num(p.price_max)) / 2;
    await sql.query(
      `insert into quotes (
        product_id, supplier_user_id, buyer_user_id, quantity, price_per_unit,
        incoterms, validity_days, notes
      ) values ($1,$2,$3,$4,$5,$6,14,$7)`,
      [
        p.id,
        p.user_id,
        context.userId,
        qty,
        mid || null,
        p.incoterms || "FOB",
        data.notes?.trim() || "Buyer requested a quotation through NEXA.",
      ],
    );
    return { ok: true as const };
  });

const QUOTE_JOIN = `
  q.id, q.request_id, q.product_id, q.supplier_user_id, q.buyer_user_id,
  q.quantity, q.price_per_unit, q.currency, q.incoterms, q.validity_days,
  q.notes, q.status, q.created_at::text as created_at,
  sp.company_name as supplier_company, bp.company_name as buyer_company,
  p.name as product_name, p.origin_state, sp.verification_level,
  r.product_name as request_product
`;

export const listMyQuotes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<Quote>(
      `select ${QUOTE_JOIN}
       from quotes q
       left join profiles sp on sp.user_id = q.supplier_user_id
       left join profiles bp on bp.user_id = q.buyer_user_id
       left join products p on p.id = q.product_id
       left join buying_requests r on r.id = q.request_id
       where q.buyer_user_id = $1 or q.supplier_user_id = $1
       order by q.created_at desc`,
      [context.userId],
    );
  });

export const listQuotesForRequest = createServerFn({ method: "GET" })
  .validator((requestId: number) => requestId)
  .handler(async ({ data: requestId }) => {
    const sql = await getSql();
    return sql.query<Quote>(
      `select ${QUOTE_JOIN}
       from quotes q
       left join profiles sp on sp.user_id = q.supplier_user_id
       left join profiles bp on bp.user_id = q.buyer_user_id
       left join products p on p.id = q.product_id
       left join buying_requests r on r.id = q.request_id
       where q.request_id = $1
       order by q.price_per_unit asc nulls last`,
      [requestId],
    );
  });

export const setQuoteStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: "accepted" | "declined" | "withdrawn" }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql.query<Quote>(
      `select ${QUOTE_JOIN}
       from quotes q
       left join profiles sp on sp.user_id = q.supplier_user_id
       left join profiles bp on bp.user_id = q.buyer_user_id
       left join products p on p.id = q.product_id
       left join buying_requests r on r.id = q.request_id
       where q.id = $1`,
      [data.id],
    );
    const quote = rows[0];
    if (!quote) throw new Error("Quote not found");
    if (data.status === "withdrawn" && quote.supplier_user_id !== context.userId) {
      throw new Error("Only the supplier can withdraw this quote");
    }
    if ((data.status === "accepted" || data.status === "declined") && quote.buyer_user_id !== context.userId) {
      throw new Error("Only the buyer can accept or decline");
    }
    await sql.query("update quotes set status = $1 where id = $2", [data.status, data.id]);
    if (data.status === "accepted") {
      await sql.query(
        `insert into orders (
          buyer_user_id, supplier_user_id, product_id, quote_id, quantity,
          unit_price, currency, incoterms, status
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,'pending')`,
        [
          quote.buyer_user_id,
          quote.supplier_user_id,
          quote.product_id,
          quote.id,
          quote.quantity,
          quote.price_per_unit,
          quote.currency,
          quote.incoterms,
        ],
      );
      if (quote.request_id) {
        await sql.query("update buying_requests set status = 'matched' where id = $1", [
          quote.request_id,
        ]);
      }
    }
    return { ok: true as const };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<Order>(
      `select o.id, o.buyer_user_id, o.supplier_user_id, o.product_id, o.quote_id,
              o.quantity, o.unit_price, o.currency, o.incoterms, o.status,
              o.created_at::text as created_at,
              p.name as product_name, bp.company_name as buyer_company,
              sp.company_name as supplier_company
       from orders o
       left join products p on p.id = o.product_id
       left join profiles bp on bp.user_id = o.buyer_user_id
       left join profiles sp on sp.user_id = o.supplier_user_id
       where o.buyer_user_id = $1 or o.supplier_user_id = $1
       order by o.created_at desc`,
      [context.userId],
    );
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: Order["status"] }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql.query<{ buyer_user_id: string; supplier_user_id: string }>(
      "select buyer_user_id, supplier_user_id from orders where id = $1",
      [data.id],
    );
    const order = rows[0];
    if (!order) throw new Error("Order not found");
    if (order.buyer_user_id !== context.userId && order.supplier_user_id !== context.userId) {
      throw new Error("Not allowed");
    }
    await sql.query("update orders set status = $1 where id = $2", [data.status, data.id]);
    return { ok: true as const };
  });
