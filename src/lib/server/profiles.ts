import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Role } from "@/lib/catalog";
import type { Profile, VerificationRequest } from "@/lib/types";

const PROFILE_COLS = `
  user_id, role, display_name, company_name, country, phone, business_type,
  city, state_region, bio, website, verification_level, identity_verified,
  business_verified, product_verified, export_docs_status, verification_notes,
  created_at::text as created_at
`;

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<Profile>(
      `select ${PROFILE_COLS} from profiles where user_id = $1`,
      [context.userId],
    );
    return rows[0] ?? null;
  });

export type ProfileInput = {
  role: Role;
  display_name: string;
  company_name?: string;
  country?: string;
  phone?: string;
  business_type?: string;
  city?: string;
  state_region?: string;
  bio?: string;
  website?: string;
};

export const upsertMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ProfileInput) => input)
  .handler(async ({ context, data }) => {
    const name = data.display_name.trim();
    if (!name) throw new Error("Name is required");
    if (!["supplier", "buyer", "admin"].includes(data.role)) {
      throw new Error("Choose an account type");
    }
    const sql = await getSql();
    const existing = await sql.query<{ role: string }>(
      "select role from profiles where user_id = $1",
      [context.userId],
    );
    if (existing[0] && data.role === "admin" && existing[0].role !== "admin") {
      throw new Error("Operator access cannot be self-assigned after onboarding");
    }
    if (data.role === "admin") {
      const admins = await sql.query<{ n: number }>(
        "select count(*)::int as n from profiles where role = 'admin'",
      );
      if ((admins[0]?.n ?? 0) >= 3 && existing[0]?.role !== "admin") {
        throw new Error("Operator seats are full. Ask an existing operator.");
      }
    }
    await sql.query(
      `insert into profiles (
        user_id, role, display_name, company_name, country, phone, business_type,
        city, state_region, bio, website
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      on conflict (user_id) do update set
        role = excluded.role,
        display_name = excluded.display_name,
        company_name = excluded.company_name,
        country = excluded.country,
        phone = excluded.phone,
        business_type = excluded.business_type,
        city = excluded.city,
        state_region = excluded.state_region,
        bio = excluded.bio,
        website = excluded.website`,
      [
        context.userId,
        data.role,
        name,
        data.company_name?.trim() || null,
        data.country?.trim() || null,
        data.phone?.trim() || null,
        data.business_type?.trim() || null,
        data.city?.trim() || null,
        data.state_region?.trim() || null,
        data.bio?.trim() || null,
        data.website?.trim() || null,
      ],
    );
    const rows = await sql.query<Profile>(
      `select ${PROFILE_COLS} from profiles where user_id = $1`,
      [context.userId],
    );
    return rows[0];
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const sql = await getSql();
    const rows = await sql.query<Profile>(
      `select ${PROFILE_COLS} from profiles where user_id = $1`,
      [userId],
    );
    return rows[0] ?? null;
  });

export const submitVerification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { level: string; document_notes: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into verification_requests (user_id, level, document_notes)
       values ($1, $2, $3)`,
      [context.userId, data.level, data.document_notes.trim()],
    );
    await sql.query(
      `update profiles set export_docs_status = case
         when export_docs_status = 'complete' then export_docs_status
         else 'pending' end
       where user_id = $1`,
      [context.userId],
    );
    return { ok: true as const };
  });

export const listMyVerification = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<VerificationRequest>(
      `select id, user_id, level, document_notes, status, admin_notes, created_at::text as created_at
       from verification_requests where user_id = $1 order by created_at desc`,
      [context.userId],
    );
  });
