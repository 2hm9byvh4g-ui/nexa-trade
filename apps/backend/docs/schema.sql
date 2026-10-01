-- NEXA Trade Database Schema
-- Create this in Supabase SQL Editor to set up the live database

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  country TEXT DEFAULT 'Nigeria',
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  verification_level TEXT DEFAULT 'identity-verified',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  country TEXT,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  verification_level TEXT DEFAULT 'identity-verified',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  quantity TEXT NOT NULL,
  moq TEXT NOT NULL,
  quality TEXT DEFAULT 'Export grade',
  certificates TEXT[] DEFAULT ARRAY['Certificate of origin'],
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT NOW()
);

-- RFQs table
CREATE TABLE IF NOT EXISTS rfqs (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES buyers(id),
  product TEXT NOT NULL,
  quantity TEXT NOT NULL,
  destination TEXT NOT NULL,
  quality TEXT DEFAULT 'Export grade',
  delivery TEXT DEFAULT 'CIF',
  deadline TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table (for future use)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table (for future use)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL REFERENCES rfqs(id),
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  buyer_id TEXT NOT NULL REFERENCES buyers(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
