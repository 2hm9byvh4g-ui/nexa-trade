export const CATEGORIES = [
  { id: "spices-botanicals", label: "Spices & botanicals", blurb: "Ginger, hibiscus, chili, and dried florals." },
  { id: "oilseeds", label: "Oilseeds", blurb: "Sesame, groundnut, soybean, and shea." },
  { id: "tree-crops", label: "Tree crops", blurb: "Cocoa, cashew, gum arabic, and palm kernel." },
  { id: "staples", label: "Staple grains", blurb: "Maize, sorghum, rice, and cassava." },
  { id: "specialty", label: "Specialty foods", blurb: "Honey, tiger nut, and other niche exports." },
  { id: "industrial", label: "Industrial & packing", blurb: "Packaging, processing, and trade services." },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const PRODUCT_IMAGES: Record<string, string> = {
  ginger: "/products/ginger.jpg",
  hibiscus: "/products/hibiscus.jpg",
  sesame: "/products/sesame.jpg",
  shea: "/products/shea.jpg",
  cashew: "/products/cashew.jpg",
  cocoa: "/products/cocoa.jpg",
  "gum-arabic": "/products/gum-arabic.jpg",
  chili: "/products/chili.jpg",
  groundnut: "/products/groundnut.jpg",
  maize: "/products/sesame.jpg",
  sorghum: "/products/sesame.jpg",
  rice: "/products/sesame.jpg",
  honey: "/products/shea.jpg",
  cassava: "/products/ginger.jpg",
  soybean: "/products/sesame.jpg",
  "palm-kernel": "/products/cocoa.jpg",
  "tiger-nut": "/products/groundnut.jpg",
  packaging: "/products/hero.jpg",
};

export function productImage(key: string | null | undefined): string {
  if (!key) return "/products/hero.jpg";
  return PRODUCT_IMAGES[key] ?? "/products/hero.jpg";
}

export const NIGERIAN_STATES = [
  { id: "KN", name: "Kano", region: "North West", x: 58, y: 24, products: ["Hibiscus", "Sesame", "Groundnut", "Chili"] },
  { id: "KD", name: "Kaduna", region: "North West", x: 50, y: 34, products: ["Ginger", "Maize", "Sorghum"] },
  { id: "KT", name: "Katsina", region: "North West", x: 52, y: 16, products: ["Sesame", "Sorghum"] },
  { id: "KB", name: "Kebbi", region: "North West", x: 32, y: 28, products: ["Rice", "Sesame"] },
  { id: "JG", name: "Jigawa", region: "North West", x: 64, y: 20, products: ["Sesame", "Gum arabic"] },
  { id: "SO", name: "Sokoto", region: "North West", x: 36, y: 14, products: ["Onion", "Livestock"] },
  { id: "ZA", name: "Zamfara", region: "North West", x: 42, y: 20, products: ["Ginger", "Maize"] },
  { id: "BE", name: "Benue", region: "North Central", x: 58, y: 52, products: ["Sesame", "Soybean", "Yam"] },
  { id: "NI", name: "Niger", region: "North Central", x: 40, y: 42, products: ["Shea", "Rice"] },
  { id: "PL", name: "Plateau", region: "North Central", x: 58, y: 44, products: ["Honey", "Irish potato"] },
  { id: "YO", name: "Yobe", region: "North East", x: 72, y: 22, products: ["Gum arabic", "Sesame"] },
  { id: "BO", name: "Borno", region: "North East", x: 80, y: 24, products: ["Gum arabic", "Livestock"] },
  { id: "BA", name: "Bauchi", region: "North East", x: 68, y: 34, products: ["Maize", "Groundnut"] },
  { id: "AD", name: "Adamawa", region: "North East", x: 78, y: 42, products: ["Maize", "Cattle"] },
  { id: "OY", name: "Oyo", region: "South West", x: 32, y: 62, products: ["Cashew", "Cocoa"] },
  { id: "OG", name: "Ogun", region: "South West", x: 28, y: 70, products: ["Cassava", "Packaging"] },
  { id: "LA", name: "Lagos", region: "South West", x: 24, y: 74, products: ["Logistics hub", "Packaging"] },
  { id: "OS", name: "Osun", region: "South West", x: 36, y: 64, products: ["Cocoa", "Cashew"] },
  { id: "ON", name: "Ondo", region: "South West", x: 40, y: 70, products: ["Cocoa", "Oil palm"] },
  { id: "ED", name: "Edo", region: "South South", x: 42, y: 66, products: ["Palm kernel", "Rubber"] },
  { id: "DE", name: "Delta", region: "South South", x: 40, y: 76, products: ["Oil palm", "Fish"] },
  { id: "RI", name: "Rivers", region: "South South", x: 48, y: 80, products: ["Palm kernel", "Aquatic"] },
  { id: "CR", name: "Cross River", region: "South South", x: 58, y: 72, products: ["Cocoa", "Palm"] },
  { id: "AB", name: "Abia", region: "South East", x: 52, y: 70, products: ["Palm oil", "Cassava"] },
  { id: "AN", name: "Anambra", region: "South East", x: 50, y: 66, products: ["Rice", "Cassava"] },
  { id: "EN", name: "Enugu", region: "South East", x: 54, y: 62, products: ["Rice", "Cashew"] },
  { id: "FC", name: "FCT Abuja", region: "North Central", x: 48, y: 48, products: ["Trade services"] },
] as const;

export const DESTINATIONS = [
  { country: "China", city: "Qingdao", activity: "High" },
  { country: "China", city: "Shanghai", activity: "High" },
  { country: "United Arab Emirates", city: "Dubai", activity: "Growing" },
  { country: "India", city: "Mumbai", activity: "Active" },
  { country: "Turkey", city: "Istanbul", activity: "Active" },
  { country: "Netherlands", city: "Rotterdam", activity: "Stable" },
  { country: "United Kingdom", city: "London", activity: "Stable" },
  { country: "Saudi Arabia", city: "Jeddah", activity: "Growing" },
  { country: "United States", city: "Houston", activity: "Emerging" },
] as const;

export const INCOTERMS = ["EXW", "FCA", "FOB", "CFR", "CIF", "DAP", "DDP"] as const;

export const GRADES = ["Export grade", "FAQ", "Premium", "Organic", "Industrial"] as const;

export const PACKAGING = ["25kg bags", "50kg bags", "Bulk", "Jute bags", "Cartons", "Drums"] as const;

export const BUSINESS_TYPES_SUPPLIER = [
  "Farmer / producer",
  "Processor",
  "Aggregator",
  "Cooperative",
  "Exporter",
  "Trading house",
] as const;

export const BUSINESS_TYPES_BUYER = [
  "Importer",
  "Distributor",
  "Manufacturer",
  "Retailer",
  "Trading house",
  "Food processor",
] as const;

export const DOC_TYPES = [
  { id: "commercial_invoice", label: "Commercial invoice" },
  { id: "packing_list", label: "Packing list" },
  { id: "certificate_of_origin", label: "Certificate of origin" },
  { id: "phytosanitary", label: "Phytosanitary certificate" },
  { id: "inspection", label: "Inspection / quality report" },
  { id: "export_registration", label: "Export registration" },
  { id: "shipping", label: "Shipping documents" },
  { id: "insurance", label: "Cargo insurance" },
] as const;

export const SEASONAL_NOTES: Record<string, string> = {
  Ginger: "Main northern harvest typically runs October–February. New-crop availability firms from November.",
  Hibiscus: "Northern harvest is concentrated November–January. Dried calyces ship through the first quarter.",
  Sesame: "White sesame harvest in the north is usually October–December. Quality is most consistent after drying.",
  Cocoa: "Main crop is typically October–January, with a light crop around April–June in the south-west.",
  Cashew: "Peak raw cashew nut season is February–May in the south-west belt.",
  Shea: "Collection in the guinea savannah generally peaks May–August.",
  "Gum arabic": "Tapping in the north-east is most active in the dry season, roughly November–April.",
  Groundnut: "Harvest in Kano and surrounding states is typically September–November.",
  Maize: "Northern harvest is often October–December; southern belts can be earlier.",
  Rice: "Kebbi and other irrigation belts can supply more evenly than rain-fed regions.",
};

export type Role = "supplier" | "buyer" | "admin";

export type VerificationLevel =
  | "registered"
  | "identity"
  | "business"
  | "product"
  | "export_ready";

export const VERIFICATION_STEPS: { id: VerificationLevel; label: string; hint: string }[] = [
  { id: "registered", label: "Registered", hint: "Account created on NEXA." },
  { id: "identity", label: "Identity verified", hint: "Personal identification reviewed." },
  { id: "business", label: "Business verified", hint: "Company registration reviewed." },
  { id: "product", label: "Product verified", hint: "Commodity and packing details reviewed." },
  { id: "export_ready", label: "Export ready", hint: "Export documentation pathway complete." },
];
