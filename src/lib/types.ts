import type { Role, VerificationLevel } from "./catalog";

export type Profile = {
  user_id: string;
  role: Role;
  display_name: string;
  company_name: string | null;
  country: string | null;
  phone: string | null;
  business_type: string | null;
  city: string | null;
  state_region: string | null;
  bio: string | null;
  website: string | null;
  verification_level: VerificationLevel;
  identity_verified: boolean;
  business_verified: boolean;
  product_verified: boolean;
  export_docs_status: "none" | "pending" | "complete";
  verification_notes: string | null;
  created_at: string;
};

export type Product = {
  id: number;
  user_id: string;
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  origin_state: string | null;
  origin_city: string | null;
  available_qty: string | number | null;
  qty_unit: string;
  moq: string | number | null;
  grade: string | null;
  packaging: string | null;
  price_min: string | number | null;
  price_max: string | number | null;
  currency: string;
  incoterms: string | null;
  certificates: string | null;
  hs_code: string | null;
  status: "draft" | "pending" | "approved" | "rejected";
  harvest_season: string | null;
  image_key: string | null;
  view_count: number;
  created_at: string;
  company_name?: string | null;
  supplier_name?: string | null;
  verification_level?: VerificationLevel;
  identity_verified?: boolean;
  business_verified?: boolean;
  product_verified?: boolean;
  export_docs_status?: string | null;
  country?: string | null;
};

export type BuyingRequest = {
  id: number;
  user_id: string;
  product_name: string;
  category: string | null;
  quantity: string | number;
  qty_unit: string;
  destination_city: string | null;
  destination_country: string | null;
  required_quality: string | null;
  packaging: string | null;
  delivery_terms: string | null;
  deadline_days: number | null;
  notes: string | null;
  status: "open" | "matched" | "completed" | "cancelled";
  match_count: number;
  created_at: string;
  company_name?: string | null;
  buyer_name?: string | null;
  country?: string | null;
};

export type Quote = {
  id: number;
  request_id: number | null;
  product_id: number | null;
  supplier_user_id: string;
  buyer_user_id: string;
  quantity: string | number | null;
  price_per_unit: string | number | null;
  currency: string;
  incoterms: string | null;
  validity_days: number | null;
  notes: string | null;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  created_at: string;
  supplier_company?: string | null;
  buyer_company?: string | null;
  product_name?: string | null;
  request_product?: string | null;
  origin_state?: string | null;
  verification_level?: VerificationLevel;
};

export type Thread = {
  id: number;
  buyer_user_id: string;
  supplier_user_id: string;
  product_id: number | null;
  request_id: number | null;
  subject: string | null;
  updated_at: string;
  created_at: string;
  other_name?: string | null;
  other_company?: string | null;
  last_body?: string | null;
};

export type Message = {
  id: number;
  thread_id: number;
  from_user_id: string;
  to_user_id: string;
  body: string;
  created_at: string;
};

export type Order = {
  id: number;
  buyer_user_id: string;
  supplier_user_id: string;
  product_id: number | null;
  quote_id: number | null;
  quantity: string | number | null;
  unit_price: string | number | null;
  currency: string;
  incoterms: string | null;
  status: "pending" | "processing" | "shipped" | "completed" | "disputed" | "cancelled";
  created_at: string;
  product_name?: string | null;
  buyer_company?: string | null;
  supplier_company?: string | null;
};

export type TradeDocument = {
  id: number;
  user_id: string;
  order_id: number | null;
  doc_type: string;
  title: string;
  notes: string | null;
  status: "draft" | "uploaded" | "verified";
  created_at: string;
};

export type VerificationRequest = {
  id: number;
  user_id: string;
  level: string;
  document_notes: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  company_name?: string | null;
  display_name?: string | null;
};

export type Report = {
  id: number;
  reporter_user_id: string;
  target_user_id: string | null;
  target_product_id: number | null;
  reason: string;
  details: string | null;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
};

export type MatchRow = Product & { score: number; reason: string };
