import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export const getIntelligence = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [byDest, byProduct, byState, quotes, products, requests] = await Promise.all([
    sql.query<{ destination_country: string; n: number; qty: string }>(
      `select coalesce(destination_country, 'Unspecified') as destination_country,
              count(*)::int as n, coalesce(sum(quantity),0)::text as qty
       from buying_requests
       group by destination_country
       order by n desc`,
    ),
    sql.query<{ product_name: string; n: number; qty: string }>(
      `select product_name, count(*)::int as n, coalesce(sum(quantity),0)::text as qty
       from buying_requests
       group by product_name
       order by n desc
       limit 8`,
    ),
    sql.query<{ origin_state: string; n: number; available: string }>(
      `select coalesce(origin_state, 'Unspecified') as origin_state,
              count(*)::int as n, coalesce(sum(available_qty),0)::text as available
       from products where status = 'approved'
       group by origin_state
       order by n desc`,
    ),
    sql.query<{ n: number; avg_price: string }>(
      `select count(*)::int as n, coalesce(avg(price_per_unit),0)::text as avg_price from quotes`,
    ),
    sql.query<{ n: number }>(`select count(*)::int as n from products where status = 'approved'`),
    sql.query<{ n: number }>(
      `select count(*)::int as n from buying_requests where status in ('open','matched')`,
    ),
  ]);
  return {
    byDest,
    byProduct,
    byState,
    quoteCount: quotes[0]?.n ?? 0,
    avgQuote: quotes[0]?.avg_price ?? "0",
    liveListings: products[0]?.n ?? 0,
    openDemand: requests[0]?.n ?? 0,
  };
});

export const getSupplierAnalytics = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const [views, quotes, products] = await Promise.all([
      sql.query<{ views: number }>(
        "select coalesce(sum(view_count),0)::int as views from products where user_id = $1",
        [context.userId],
      ),
      sql.query<{ n: number }>(
        "select count(*)::int as n from quotes where supplier_user_id = $1",
        [context.userId],
      ),
      sql.query<{ n: number }>(
        "select count(*)::int as n from products where user_id = $1",
        [context.userId],
      ),
    ]);
    return {
      views: views[0]?.views ?? 0,
      quotes: quotes[0]?.n ?? 0,
      listings: products[0]?.n ?? 0,
    };
  });
