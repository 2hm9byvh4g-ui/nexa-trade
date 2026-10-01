import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { BuyingRequest, Product, Profile, Report, VerificationRequest } from "@/lib/types";

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql.query<{ role: string }>("select role from profiles where user_id = $1", [
    userId,
  ]);
  if (rows[0]?.role !== "admin") throw new Error("Forbidden");
  return sql;
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireAdmin(context.userId);
    const [users, products, requests, verifications, reports, orders] = await Promise.all([
      sql.query<{ role: string; n: number }>(
        "select role, count(*)::int as n from profiles group by role",
      ),
      sql.query<{ status: string; n: number }>(
        "select status, count(*)::int as n from products group by status",
      ),
      sql.query<{ status: string; n: number }>(
        "select status, count(*)::int as n from buying_requests group by status",
      ),
      sql.query<{ status: string; n: number }>(
        "select status, count(*)::int as n from verification_requests group by status",
      ),
      sql.query<{ status: string; n: number }>(
        "select status, count(*)::int as n from reports group by status",
      ),
      sql.query<{ status: string; n: number }>(
        "select status, count(*)::int as n from orders group by status",
      ),
    ]);
    return { users, products, requests, verifications, reports, orders };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireAdmin(context.userId);
    return sql.query<Profile>(
      `select user_id, role, display_name, company_name, country, phone, business_type,
              city, state_region, bio, website, verification_level, identity_verified,
              business_verified, product_verified, export_docs_status, verification_notes,
              created_at::text as created_at
       from profiles order by created_at desc`,
    );
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireAdmin(context.userId);
    return sql.query<Product>(
      `select p.id, p.user_id, p.name, p.category, p.subcategory, p.description,
              p.origin_state, p.origin_city, p.available_qty, p.qty_unit, p.moq, p.grade,
              p.packaging, p.price_min, p.price_max, p.currency, p.incoterms, p.certificates,
              p.hs_code, p.status, p.harvest_season, p.image_key, p.view_count,
              p.created_at::text as created_at, pr.company_name, pr.display_name as supplier_name
       from products p join profiles pr on pr.user_id = p.user_id
       order by case p.status when 'pending' then 0 else 1 end, p.created_at desc`,
    );
  });

export const adminSetProductStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: "approved" | "rejected" | "pending" }) => input)
  .handler(async ({ context, data }) => {
    const sql = await requireAdmin(context.userId);
    await sql.query("update products set status = $1 where id = $2", [data.status, data.id]);
    return { ok: true as const };
  });

export const adminListVerifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireAdmin(context.userId);
    return sql.query<VerificationRequest>(
      `select v.id, v.user_id, v.level, v.document_notes, v.status, v.admin_notes,
              v.created_at::text as created_at, p.company_name, p.display_name
       from verification_requests v
       join profiles p on p.user_id = v.user_id
       order by case v.status when 'pending' then 0 else 1 end, v.created_at desc`,
    );
  });

export const adminDecideVerification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: "approved" | "rejected"; admin_notes?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await requireAdmin(context.userId);
    const rows = await sql.query<{ user_id: string; level: string }>(
      "select user_id, level from verification_requests where id = $1",
      [data.id],
    );
    const row = rows[0];
    if (!row) throw new Error("Not found");
    await sql.query(
      "update verification_requests set status = $1, admin_notes = $2 where id = $3",
      [data.status, data.admin_notes ?? null, data.id],
    );
    if (data.status === "approved") {
      const level = row.level;
      if (level === "identity") {
        await sql.query(
          `update profiles set identity_verified = true,
             verification_level = case when verification_level in ('registered') then 'identity' else verification_level end
           where user_id = $1`,
          [row.user_id],
        );
      } else if (level === "business") {
        await sql.query(
          `update profiles set business_verified = true, identity_verified = true,
             verification_level = case when verification_level in ('registered','identity') then 'business' else verification_level end
           where user_id = $1`,
          [row.user_id],
        );
      } else if (level === "product") {
        await sql.query(
          `update profiles set product_verified = true, business_verified = true, identity_verified = true,
             verification_level = case when verification_level in ('export_ready') then verification_level else 'product' end
           where user_id = $1`,
          [row.user_id],
        );
      } else if (level === "export") {
        await sql.query(
          `update profiles set product_verified = true, business_verified = true, identity_verified = true,
             export_docs_status = 'complete', verification_level = 'export_ready'
           where user_id = $1`,
          [row.user_id],
        );
      }
    }
    return { ok: true as const };
  });

export const adminListRequests = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireAdmin(context.userId);
    return sql.query<BuyingRequest>(
      `select r.id, r.user_id, r.product_name, r.category, r.quantity, r.qty_unit,
              r.destination_city, r.destination_country, r.required_quality, r.packaging,
              r.delivery_terms, r.deadline_days, r.notes, r.status, r.match_count,
              r.created_at::text as created_at, pr.company_name, pr.display_name as buyer_name
       from buying_requests r join profiles pr on pr.user_id = r.user_id
       order by r.created_at desc`,
    );
  });

export const adminListReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireAdmin(context.userId);
    return sql.query<Report>(
      `select id, reporter_user_id, target_user_id, target_product_id, reason, details,
              status, created_at::text as created_at
       from reports order by created_at desc`,
    );
  });

export const adminSetReportStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: Report["status"] }) => input)
  .handler(async ({ context, data }) => {
    const sql = await requireAdmin(context.userId);
    await sql.query("update reports set status = $1 where id = $2", [data.status, data.id]);
    return { ok: true as const };
  });

export const fileReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { target_user_id?: string; target_product_id?: number; reason: string; details?: string }) =>
      input,
  )
  .handler(async ({ context, data }) => {
    if (!data.reason.trim()) throw new Error("Reason required");
    const sql = await getSql();
    await sql.query(
      `insert into reports (reporter_user_id, target_user_id, target_product_id, reason, details)
       values ($1,$2,$3,$4,$5)`,
      [
        context.userId,
        data.target_user_id ?? null,
        data.target_product_id ?? null,
        data.reason.trim(),
        data.details?.trim() || null,
      ],
    );
    return { ok: true as const };
  });
