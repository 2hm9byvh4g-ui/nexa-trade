import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Product, Profile } from "@/lib/types";

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

export const listProducts = createServerFn({ method: "GET" })
  .validator((input: { q?: string; category?: string; state?: string } = {}) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const params: unknown[] = [];
    const where = ["p.status = 'approved'"];
    if (data.q?.trim()) {
      params.push(`%${data.q.trim()}%`);
      where.push(
        `(p.name ilike $${params.length} or p.subcategory ilike $${params.length} or p.description ilike $${params.length} or p.origin_state ilike $${params.length})`,
      );
    }
    if (data.category) {
      params.push(data.category);
      where.push(`p.category = $${params.length}`);
    }
    if (data.state) {
      params.push(data.state);
      where.push(`p.origin_state = $${params.length}`);
    }
    return sql.query<Product>(
      `select ${PRODUCT_JOIN}
       from products p
       join profiles pr on pr.user_id = p.user_id
       where ${where.join(" and ")}
       order by p.view_count desc, p.created_at desc`,
      params,
    );
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    const rows = await sql.query<Product>(
      `select ${PRODUCT_JOIN}
       from products p
       join profiles pr on pr.user_id = p.user_id
       where p.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  });

export const incrementProductView = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    await sql.query(`update products set view_count = view_count + 1 where id = $1`, [id]);
    return { ok: true as const };
  });

export const listSuppliers = createServerFn({ method: "GET" })
  .validator((input: { q?: string } = {}) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const params: unknown[] = [];
    let extra = "";
    if (data.q?.trim()) {
      params.push(`%${data.q.trim()}%`);
      extra = `and (pr.company_name ilike $1 or pr.display_name ilike $1 or pr.state_region ilike $1)`;
    }
    return sql.query<
      Profile & { product_count: number; sample_products: string | null }
    >(
      `select pr.user_id, pr.role, pr.display_name, pr.company_name, pr.country, pr.phone,
              pr.business_type, pr.city, pr.state_region, pr.bio, pr.website,
              pr.verification_level, pr.identity_verified, pr.business_verified,
              pr.product_verified, pr.export_docs_status, pr.verification_notes,
              pr.created_at::text as created_at,
              count(p.id)::int as product_count,
              string_agg(distinct p.subcategory, ', ') as sample_products
       from profiles pr
       left join products p on p.user_id = pr.user_id and p.status = 'approved'
       where pr.role = 'supplier' ${extra}
       group by pr.user_id
       order by
         case pr.verification_level
           when 'export_ready' then 5
           when 'product' then 4
           when 'business' then 3
           when 'identity' then 2
           else 1 end desc,
         product_count desc`,
      params,
    );
  });

export const listSupplierProducts = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const sql = await getSql();
    return sql.query<Product>(
      `select ${PRODUCT_JOIN}
       from products p
       join profiles pr on pr.user_id = p.user_id
       where p.user_id = $1 and p.status = 'approved'
       order by p.created_at desc`,
      [userId],
    );
  });

export const listMyProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<Product>(
      `select ${PRODUCT_JOIN}
       from products p
       join profiles pr on pr.user_id = p.user_id
       where p.user_id = $1
       order by p.created_at desc`,
      [context.userId],
    );
  });

export type ProductInput = {
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  origin_state?: string;
  origin_city?: string;
  available_qty?: number;
  qty_unit?: string;
  moq?: number;
  grade?: string;
  packaging?: string;
  price_min?: number;
  price_max?: number;
  incoterms?: string;
  certificates?: string;
  hs_code?: string;
  harvest_season?: string;
  image_key?: string;
};

export const createProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ProductInput) => input)
  .handler(async ({ context, data }) => {
    if (!data.name.trim()) throw new Error("Product name is required");
    const sql = await getSql();
    const profile = await sql.query<{ role: string }>(
      "select role from profiles where user_id = $1",
      [context.userId],
    );
    if (profile[0]?.role !== "supplier" && profile[0]?.role !== "admin") {
      throw new Error("Only suppliers can list products");
    }
    const certs = data.certificates
      ? JSON.stringify(
          data.certificates
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        )
      : "[]";
    const rows = await sql.query<{ id: number }>(
      `insert into products (
        user_id, name, category, subcategory, description, origin_state, origin_city,
        available_qty, qty_unit, moq, grade, packaging, price_min, price_max,
        incoterms, certificates, hs_code, harvest_season, image_key, status
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'pending')
      returning id`,
      [
        context.userId,
        data.name.trim(),
        data.category,
        data.subcategory?.trim() || null,
        data.description?.trim() || null,
        data.origin_state?.trim() || null,
        data.origin_city?.trim() || null,
        data.available_qty ?? null,
        data.qty_unit || "tonnes",
        data.moq ?? null,
        data.grade || null,
        data.packaging || null,
        data.price_min ?? null,
        data.price_max ?? null,
        data.incoterms || null,
        certs,
        data.hs_code || null,
        data.harvest_season || null,
        data.image_key || null,
      ],
    );
    return { id: rows[0].id };
  });

export const toggleSavedProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((productId: number) => productId)
  .handler(async ({ context, data: productId }) => {
    const sql = await getSql();
    const existing = await sql.query(
      "select 1 from saved_products where user_id = $1 and product_id = $2",
      [context.userId, productId],
    );
    if (existing.length) {
      await sql.query("delete from saved_products where user_id = $1 and product_id = $2", [
        context.userId,
        productId,
      ]);
      return { saved: false };
    }
    await sql.query("insert into saved_products (user_id, product_id) values ($1, $2)", [
      context.userId,
      productId,
    ]);
    return { saved: true };
  });

export const listSavedProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<{ product_id: number }>(
      "select product_id from saved_products where user_id = $1",
      [context.userId],
    );
  });
