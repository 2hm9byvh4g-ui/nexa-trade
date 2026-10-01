-- NEXA Trade schema + catalog seed (Nigeria → China pilot)

create table if not exists profiles (
  user_id text primary key,
  role text not null check (role in ('supplier', 'buyer', 'admin')),
  display_name text not null,
  company_name text,
  country text,
  phone text,
  business_type text,
  city text,
  state_region text,
  bio text,
  website text,
  verification_level text not null default 'registered',
  identity_verified boolean not null default false,
  business_verified boolean not null default false,
  product_verified boolean not null default false,
  export_docs_status text not null default 'none',
  verification_notes text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id serial primary key,
  user_id text not null,
  name text not null,
  category text not null,
  subcategory text,
  description text,
  origin_state text,
  origin_city text,
  available_qty numeric,
  qty_unit text not null default 'tonnes',
  moq numeric,
  grade text,
  packaging text,
  price_min numeric,
  price_max numeric,
  currency text not null default 'USD',
  incoterms text,
  certificates text,
  hs_code text,
  status text not null default 'pending',
  harvest_season text,
  image_key text,
  view_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists products_user_id_idx on products (user_id);
create index if not exists products_status_idx on products (status);
create index if not exists products_category_idx on products (category);

create table if not exists buying_requests (
  id serial primary key,
  user_id text not null,
  product_name text not null,
  category text,
  quantity numeric not null,
  qty_unit text not null default 'tonnes',
  destination_city text,
  destination_country text,
  required_quality text,
  packaging text,
  delivery_terms text,
  deadline_days integer,
  notes text,
  status text not null default 'open',
  match_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists buying_requests_user_id_idx on buying_requests (user_id);
create index if not exists buying_requests_status_idx on buying_requests (status);

create table if not exists quotes (
  id serial primary key,
  request_id integer,
  product_id integer,
  supplier_user_id text not null,
  buyer_user_id text not null,
  quantity numeric,
  price_per_unit numeric,
  currency text not null default 'USD',
  incoterms text,
  validity_days integer,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists quotes_buyer_idx on quotes (buyer_user_id);
create index if not exists quotes_supplier_idx on quotes (supplier_user_id);

create table if not exists threads (
  id serial primary key,
  buyer_user_id text not null,
  supplier_user_id text not null,
  product_id integer,
  request_id integer,
  subject text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id serial primary key,
  thread_id integer not null,
  from_user_id text not null,
  to_user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_thread_idx on messages (thread_id);

create table if not exists orders (
  id serial primary key,
  buyer_user_id text not null,
  supplier_user_id text not null,
  product_id integer,
  quote_id integer,
  quantity numeric,
  unit_price numeric,
  currency text not null default 'USD',
  incoterms text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id serial primary key,
  user_id text not null,
  order_id integer,
  doc_type text not null,
  title text not null,
  notes text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists verification_requests (
  id serial primary key,
  user_id text not null,
  level text not null,
  document_notes text,
  status text not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id serial primary key,
  reporter_user_id text not null,
  target_user_id text,
  target_product_id integer,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists saved_products (
  user_id text not null,
  product_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- Catalog suppliers (platform listings, not live auth users)
insert into profiles (user_id, role, display_name, company_name, country, phone, business_type, city, state_region, bio, verification_level, identity_verified, business_verified, product_verified, export_docs_status) values
('catalog-sahel-kano', 'supplier', 'Amina Bello', 'Sahel Botanicals Ltd', 'Nigeria', '+234 803 110 4401', 'Exporter', 'Kano', 'Kano', 'Processor and exporter of dried hibiscus and chili from Kano and Jigawa farms.', 'export_ready', true, true, true, 'complete'),
('catalog-kaduna-rhizome', 'supplier', 'Ibrahim Sule', 'Kaduna Rhizome Cooperative', 'Nigeria', '+234 809 221 1188', 'Cooperative', 'Kafanchan', 'Kaduna', 'Smallholder ginger cooperative aggregating export-grade dried ginger from southern Kaduna.', 'product', true, true, true, 'pending'),
('catalog-jigawa-sesame', 'supplier', 'Hauwa Yusuf', 'Jigawa Sesame Export', 'Nigeria', '+234 706 441 2290', 'Exporter', 'Dutse', 'Jigawa', 'White sesame aggregator serving China and Middle East buyers.', 'export_ready', true, true, true, 'complete'),
('catalog-benue-sesame', 'supplier', 'Terna Aondo', 'Benue Oilseeds Ltd', 'Nigeria', '+234 812 334 0091', 'Processor', 'Makurdi', 'Benue', 'Brown sesame and soybean from Benue farming clusters.', 'business', true, true, false, 'pending'),
('catalog-niger-shea', 'supplier', 'Fatima Lawal', 'Niger Shea Collective', 'Nigeria', '+234 805 778 3312', 'Cooperative', 'Bida', 'Niger', 'Women-led shea collection and unrefined butter processing.', 'product', true, true, true, 'pending'),
('catalog-yobe-gum', 'supplier', 'Musa Goni', 'Yobe Gum Arabic Ltd', 'Nigeria', '+234 803 990 2176', 'Exporter', 'Damaturu', 'Yobe', 'Grade 1 and Grade 2 gum arabic from Yobe and Borno.', 'export_ready', true, true, true, 'complete'),
('catalog-oyo-cashew', 'supplier', 'Adewale Ojo', 'Oyo Cashew Processors', 'Nigeria', '+234 809 555 1044', 'Processor', 'Ogbomosho', 'Oyo', 'Raw cashew nuts and limited kernel processing for export.', 'business', true, true, false, 'none'),
('catalog-ondo-cocoa', 'supplier', 'Bunmi Adekunle', 'Ondo Cocoa Alliance', 'Nigeria', '+234 807 212 8841', 'Aggregator', 'Akure', 'Ondo', 'Fermented and dried cocoa beans from Ondo and Osun belts.', 'export_ready', true, true, true, 'complete'),
('catalog-kebbi-grain', 'supplier', 'Umar Argungu', 'Kebbi Staple Grains', 'Nigeria', '+234 806 441 7720', 'Farmer / producer', 'Argungu', 'Kebbi', 'Irrigated rice and sesame from Kebbi production zones.', 'identity', true, false, false, 'none'),
('catalog-kano-groundnut', 'supplier', 'Sani Dambatta', 'Kano Groundnut Corp', 'Nigeria', '+234 803 221 6677', 'Processor', 'Dambatta', 'Kano', 'Groundnut in-shell and kernels for oil crushers.', 'product', true, true, true, 'pending'),
('catalog-kaduna-maize', 'supplier', 'Chinedu Bala', 'Northern Grains Kaduna', 'Nigeria', '+234 810 119 3345', 'Aggregator', 'Zaria', 'Kaduna', 'Maize and sorghum aggregation for regional and export buyers.', 'business', true, true, false, 'none'),
('catalog-plateau-honey', 'supplier', 'Ngozi Pam', 'Plateau Apiaries', 'Nigeria', '+234 809 771 2203', 'Producer', 'Jos', 'Plateau', 'Raw multi-floral honey from the Jos plateau.', 'identity', true, false, false, 'none'),
('catalog-ogun-cassava', 'supplier', 'Kehinde Adebanjo', 'Ogun Cassava Chips', 'Nigeria', '+234 802 445 1180', 'Processor', 'Abeokuta', 'Ogun', 'Dried cassava chips for industrial starch and feed.', 'business', true, true, false, 'pending'),
('catalog-edo-pkc', 'supplier', 'Osagie Eboigbe', 'Edo Palm Kernel Ltd', 'Nigeria', '+234 803 667 4412', 'Processor', 'Benin City', 'Edo', 'Palm kernel and PKC for industrial buyers.', 'registered', false, false, false, 'none')
on conflict (user_id) do nothing;

insert into profiles (user_id, role, display_name, company_name, country, phone, business_type, city, state_region, bio, verification_level, identity_verified, business_verified, product_verified, export_docs_status) values
('catalog-buyer-qingdao', 'buyer', 'Li Wei', 'EastPort Commodities', 'China', '+86 532 0000 1100', 'Importer', 'Qingdao', null, 'Chinese importer of African oilseeds and spices.', 'business', true, true, false, 'none'),
('catalog-buyer-shanghai', 'buyer', 'Chen Hao', 'Jiangnan Botanicals', 'China', '+86 21 0000 2211', 'Food processor', 'Shanghai', null, 'Botanicals and dried ginger for beverage manufacturers.', 'identity', true, false, false, 'none'),
('catalog-buyer-dubai', 'buyer', 'Sara Al Maktoum', 'Gulf Botanicals Trading', 'United Arab Emirates', '+971 4 000 2210', 'Distributor', 'Dubai', null, 'GCC distributor of hibiscus, spices, and shea.', 'business', true, true, false, 'none'),
('catalog-buyer-mumbai', 'buyer', 'Ravi Mehta', 'Deccan Spices Import', 'India', '+91 22 0000 4411', 'Importer', 'Mumbai', null, 'Indian spice house sourcing ginger and sesame.', 'identity', true, false, false, 'none'),
('catalog-buyer-rotterdam', 'buyer', 'Eva Bakker', 'Rhine Agro BV', 'Netherlands', '+31 10 000 1188', 'Trading house', 'Rotterdam', null, 'European agri-commodity trader.', 'business', true, true, false, 'none')
on conflict (user_id) do nothing;

insert into products (id, user_id, name, category, subcategory, description, origin_state, origin_city, available_qty, moq, grade, packaging, price_min, price_max, incoterms, certificates, hs_code, status, harvest_season, image_key, view_count) values
(1, 'catalog-kaduna-rhizome', 'Nigerian dried ginger', 'spices-botanicals', 'Ginger', 'Sun-dried split ginger from southern Kaduna. Moisture controlled for export, suitable for grinding and oleoresin.', 'Kaduna', 'Kafanchan', 50, 5, 'Export grade', '25kg / 50kg bags', 2800, 4200, 'FOB', '["Phytosanitary","Certificate of origin"]', '0910.11', 'approved', 'October–February', 'ginger', 186),
(2, 'catalog-sahel-kano', 'Dried hibiscus calyces', 'spices-botanicals', 'Hibiscus', 'Deep-red dried zobo/roselle calyces, hand-sorted, low foreign matter. Popular with beverage buyers in China and the UAE.', 'Kano', 'Kano', 20, 5, 'Export grade', '25kg bags', 1800, 3200, 'CIF', '["Phytosanitary","Certificate of origin","SGS inspection available"]', '1211.90', 'approved', 'November–January', 'hibiscus', 244),
(3, 'catalog-jigawa-sesame', 'White sesame seeds', 'oilseeds', 'Sesame', 'Humera-style white sesame, machine cleaned, 99/1/1 quality target. Regular shipments toward Qingdao.', 'Jigawa', 'Dutse', 120, 20, 'Export grade', '50kg bags', 1400, 2200, 'CIF', '["Phytosanitary","Certificate of origin"]', '1207.40', 'approved', 'October–December', 'sesame', 312),
(4, 'catalog-benue-sesame', 'Brown sesame seeds', 'oilseeds', 'Sesame', 'Brown sesame from Benue clusters. Suitable for oil crush and tahini.', 'Benue', 'Makurdi', 80, 16, 'FAQ', '50kg bags', 1200, 1800, 'FOB', '["Certificate of origin"]', '1207.40', 'approved', 'October–December', 'sesame', 98),
(5, 'catalog-niger-shea', 'Unrefined shea butter', 'oilseeds', 'Shea', 'Traditionally processed unrefined shea butter from women collectors in Niger State. Cosmetic and edible grades available.', 'Niger', 'Bida', 15, 2, 'Premium', '25kg cartons', 2500, 4000, 'FOB', '["Certificate of origin"]', '1515.90', 'approved', 'May–August', 'shea', 141),
(6, 'catalog-yobe-gum', 'Gum arabic Grade 1', 'tree-crops', 'Gum arabic', 'Clean Grade 1 gum arabic nodules, low bark content. Used in beverages, confectionery, and pharmaceuticals.', 'Yobe', 'Damaturu', 40, 5, 'Export grade', '50kg bags', 2000, 3500, 'CIF', '["Certificate of origin","Inspection"]', '1301.20', 'approved', 'November–April', 'gum-arabic', 167),
(7, 'catalog-oyo-cashew', 'Raw cashew nuts', 'tree-crops', 'Cashew', 'West African RCN, outturn tested. Main crop from Oyo and nearby belts.', 'Oyo', 'Ogbomosho', 200, 20, 'FAQ', '80kg jute bags', 1100, 1600, 'FOB', '["Phytosanitary","Certificate of origin"]', '0801.31', 'approved', 'February–May', 'cashew', 209),
(8, 'catalog-ondo-cocoa', 'Fermented cocoa beans', 'tree-crops', 'Cocoa', 'West African cocoa, fermented and dried. Bean count and moisture available on request.', 'Ondo', 'Akure', 90, 12, 'Export grade', '65kg jute bags', 5200, 7800, 'FOB', '["Phytosanitary","Certificate of origin"]', '1801.00', 'approved', 'October–January', 'cocoa', 275),
(9, 'catalog-sahel-kano', 'Dried red chili', 'spices-botanicals', 'Chili', 'Sun-dried whole red chili, medium heat, sorted. Suitable for grinding and crushed chili.', 'Kano', 'Kano', 25, 5, 'Export grade', '25kg bags', 1500, 2800, 'FOB', '["Phytosanitary"]', '0904.21', 'approved', 'October–January', 'chili', 88),
(10, 'catalog-kano-groundnut', 'Groundnut in-shell', 'oilseeds', 'Groundnut', 'Kano groundnut, in-shell, for roasting and crush. Aflatoxin testing can be arranged through third-party labs.', 'Kano', 'Dambatta', 60, 10, 'FAQ', '50kg bags', 900, 1400, 'FOB', '["Certificate of origin"]', '1202.41', 'approved', 'September–November', 'groundnut', 76),
(11, 'catalog-kaduna-maize', 'Yellow maize', 'staples', 'Maize', 'Northern yellow maize, suitable for feed and industrial use. Moisture and broken grain on spec sheet.', 'Kaduna', 'Zaria', 300, 50, 'FAQ', 'Bulk / 50kg', 220, 320, 'FOB', '["Certificate of origin"]', '1005.90', 'approved', 'October–December', 'maize', 54),
(12, 'catalog-kaduna-maize', 'Sorghum', 'staples', 'Sorghum', 'Red and white sorghum from Kaduna aggregators.', 'Kaduna', 'Zaria', 150, 25, 'FAQ', '50kg bags', 240, 360, 'FOB', '["Certificate of origin"]', '1007.10', 'approved', 'October–December', 'sorghum', 41),
(13, 'catalog-kebbi-grain', 'Kebbi paddy rice', 'staples', 'Rice', 'Irrigated paddy from Kebbi production zones. Milling can be arranged with partner mills.', 'Kebbi', 'Argungu', 80, 20, 'FAQ', '50kg bags', 380, 520, 'EXW', '[]', '1006.10', 'approved', 'Year-round irrigation', 'rice', 63),
(14, 'catalog-plateau-honey', 'Raw plateau honey', 'specialty', 'Honey', 'Unprocessed multi-floral honey. Packed in food-grade drums. Lab analysis on request.', 'Plateau', 'Jos', 8, 1, 'Premium', 'Drums', 3200, 4800, 'FOB', '["Lab analysis available"]', '0409.00', 'approved', 'Year-round', 'honey', 119),
(15, 'catalog-ogun-cassava', 'Dried cassava chips', 'staples', 'Cassava', 'Sun-dried cassava chips for starch and feed buyers.', 'Ogun', 'Abeokuta', 100, 20, 'Industrial', '50kg bags', 180, 280, 'FOB', '["Certificate of origin"]', '0714.10', 'approved', 'Year-round', 'cassava', 37),
(16, 'catalog-edo-pkc', 'Palm kernel', 'tree-crops', 'Palm kernel', 'Palm kernel for crushers. PKC also available.', 'Edo', 'Benin City', 70, 15, 'Industrial', 'Bulk', 420, 640, 'FOB', '[]', '1513.21', 'approved', 'Year-round', 'palm-kernel', 29),
(17, 'catalog-benue-sesame', 'Soybeans', 'oilseeds', 'Soybean', 'Non-GMO soybeans from Benue. Suitable for crush and food use.', 'Benue', 'Makurdi', 110, 20, 'FAQ', '50kg bags', 480, 680, 'FOB', '["Certificate of origin"]', '1201.90', 'approved', 'October–December', 'soybean', 58),
(18, 'catalog-jigawa-sesame', 'White sesame 99/2/1', 'oilseeds', 'Sesame', 'Slightly broader spec white sesame for oil crushers needing volume.', 'Jigawa', 'Hadejia', 90, 22, 'FAQ', '50kg bags', 1250, 1900, 'CIF', '["Phytosanitary"]', '1207.40', 'approved', 'October–December', 'sesame', 72)
on conflict (id) do nothing;

select setval('products_id_seq', 18);

insert into buying_requests (id, user_id, product_name, category, quantity, destination_city, destination_country, required_quality, packaging, delivery_terms, deadline_days, notes, status, match_count) values
(1, 'catalog-buyer-qingdao', 'Nigerian sesame', 'oilseeds', 100, 'Qingdao', 'China', 'Export grade', '50kg bags', 'CIF', 30, 'Looking for white sesame, 99/1/1 or close. Regular monthly potential if first shipment is clean.', 'open', 3),
(2, 'catalog-buyer-shanghai', 'Dried ginger', 'spices-botanicals', 50, 'Shanghai', 'China', 'Export grade', '25kg bags', 'CIF', 30, 'Need dried split ginger for beverage extract. Moisture and fibre data required.', 'open', 2),
(3, 'catalog-buyer-dubai', 'Dried hibiscus', 'spices-botanicals', 30, 'Jebel Ali', 'United Arab Emirates', 'Export grade', '25kg bags', 'CIF', 21, 'Deep colour preferred. Trial 30t, then standing order.', 'open', 1),
(4, 'catalog-buyer-mumbai', 'Dried ginger', 'spices-botanicals', 40, 'Nhava Sheva', 'India', 'FAQ', '50kg bags', 'FOB', 45, 'Indian spice house. Can work FOB Lagos or Tin Can.', 'open', 2),
(5, 'catalog-buyer-rotterdam', 'Cocoa beans', 'tree-crops', 80, 'Rotterdam', 'Netherlands', 'Export grade', 'Jute bags', 'CIF', 40, 'West African cocoa, bean count and moisture to be confirmed.', 'matched', 1),
(6, 'catalog-buyer-qingdao', 'Gum arabic', 'tree-crops', 25, 'Qingdao', 'China', 'Grade 1', '50kg bags', 'CIF', 35, 'Grade 1 nodules. Need inspection photos before booking.', 'open', 1)
on conflict (id) do nothing;

select setval('buying_requests_id_seq', 6);

insert into quotes (id, request_id, product_id, supplier_user_id, buyer_user_id, quantity, price_per_unit, incoterms, validity_days, notes, status) values
(1, 1, 3, 'catalog-jigawa-sesame', 'catalog-buyer-qingdao', 100, 1680, 'CIF', 14, 'White sesame 99/1/1, CIF Qingdao, ready within 21 days of contract.', 'pending'),
(2, 1, 18, 'catalog-jigawa-sesame', 'catalog-buyer-qingdao', 90, 1520, 'CIF', 14, 'Alternate 99/2/1 lot if volume is the priority.', 'pending'),
(3, 1, 4, 'catalog-benue-sesame', 'catalog-buyer-qingdao', 80, 1450, 'FOB', 10, 'Brown sesame FOB Lagos. Can blend if required.', 'pending'),
(4, 2, 1, 'catalog-kaduna-rhizome', 'catalog-buyer-shanghai', 50, 3450, 'CIF', 21, 'Dried split ginger, moisture target under 12%.', 'pending'),
(5, 3, 2, 'catalog-sahel-kano', 'catalog-buyer-dubai', 20, 2400, 'CIF', 14, 'Can supply 20t now, balance in 3 weeks.', 'pending'),
(6, 5, 8, 'catalog-ondo-cocoa', 'catalog-buyer-rotterdam', 80, 6400, 'CIF', 21, 'Main crop beans, CIF Rotterdam.', 'accepted'),
(7, 6, 6, 'catalog-yobe-gum', 'catalog-buyer-qingdao', 25, 2750, 'CIF', 21, 'Grade 1 gum arabic, inspection photos on request.', 'pending')
on conflict (id) do nothing;

select setval('quotes_id_seq', 7);

insert into orders (id, buyer_user_id, supplier_user_id, product_id, quote_id, quantity, unit_price, incoterms, status) values
(1, 'catalog-buyer-rotterdam', 'catalog-ondo-cocoa', 8, 6, 80, 6400, 'CIF', 'processing')
on conflict (id) do nothing;

select setval('orders_id_seq', 1);

insert into threads (id, buyer_user_id, supplier_user_id, product_id, request_id, subject) values
(1, 'catalog-buyer-qingdao', 'catalog-jigawa-sesame', 3, 1, 'White sesame — 100t CIF Qingdao'),
(2, 'catalog-buyer-shanghai', 'catalog-kaduna-rhizome', 1, 2, 'Dried ginger enquiry')
on conflict (id) do nothing;

select setval('threads_id_seq', 2);

insert into messages (thread_id, from_user_id, to_user_id, body) values
(1, 'catalog-buyer-qingdao', 'catalog-jigawa-sesame', 'We need 100 tonnes of Nigerian white sesame, CIF Qingdao, within 30 days. Please confirm spec and FOB/CIF.'),
(1, 'catalog-jigawa-sesame', 'catalog-buyer-qingdao', 'We can supply 100 tonnes of 99/1/1 white sesame. CIF Qingdao is USD 1,680 per tonne. Validity 14 days.'),
(2, 'catalog-buyer-shanghai', 'catalog-kaduna-rhizome', 'Please quote 50 tonnes dried ginger, export grade, 25kg bags.'),
(2, 'catalog-kaduna-rhizome', 'catalog-buyer-shanghai', 'We can supply 50 tonnes. Moisture target under 12%. CIF Shanghai available.');

insert into documents (user_id, order_id, doc_type, title, notes, status) values
('catalog-ondo-cocoa', 1, 'commercial_invoice', 'Commercial invoice — cocoa 80t', 'Draft invoice for Rhine Agro CIF Rotterdam.', 'uploaded'),
('catalog-ondo-cocoa', 1, 'packing_list', 'Packing list — cocoa 80t', '65kg jute bags.', 'draft'),
('catalog-ondo-cocoa', 1, 'certificate_of_origin', 'Certificate of origin', 'To be issued via the authorised chamber pathway.', 'draft'),
('catalog-ondo-cocoa', 1, 'phytosanitary', 'Phytosanitary certificate', 'Arrange with the relevant plant quarantine authority. NEXA does not issue this document.', 'draft');

insert into verification_requests (user_id, level, document_notes, status) values
('catalog-kebbi-grain', 'business', 'CAC registration and farm cluster list submitted for review.', 'pending'),
('catalog-edo-pkc', 'identity', 'Director ID uploaded.', 'pending');
