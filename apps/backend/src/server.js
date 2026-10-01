import express from 'express';
import cors from 'cors';
import { readDb, writeDb, createId } from './data/mockDb.js';
import { supabase, hasSupabase } from './supabaseClient.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const listSuppliers = async () => {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (!error) return data;
    console.error('Supabase suppliers read error:', error.message);
  }

  return readDb().suppliers;
};

const createSupplier = async (payload) => {
  if (hasSupabase && supabase) {
    const entity = {
      id: payload.id || createId('sup'),
      name: payload.name,
      company: payload.company,
      country: payload.country || 'Nigeria',
      email: payload.email,
      status: payload.status || 'active',
      verification_level: payload.verificationLevel || 'identity-verified',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('suppliers').insert(entity).select().single();
    if (!error) return data;
    console.error('Supabase suppliers insert error:', error.message);
  }

  const db = readDb();
  const supplier = {
    id: payload.id || createId('sup'),
    name: payload.name,
    company: payload.company,
    country: payload.country || 'Nigeria',
    email: payload.email,
    status: payload.status || 'active',
    verificationLevel: payload.verificationLevel || 'identity-verified',
    createdAt: new Date().toISOString()
  };
  db.suppliers.push(supplier);
  writeDb(db);
  return supplier;
};

const listBuyers = async () => {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from('buyers').select('*');
    if (!error) return data;
    console.error('Supabase buyers read error:', error.message);
  }

  return readDb().buyers;
};

const createBuyer = async (payload) => {
  if (hasSupabase && supabase) {
    const entity = {
      id: payload.id || createId('buy'),
      name: payload.name,
      company: payload.company,
      country: payload.country || 'China',
      email: payload.email,
      status: payload.status || 'active',
      verification_level: payload.verificationLevel || 'identity-verified',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('buyers').insert(entity).select().single();
    if (!error) return data;
    console.error('Supabase buyers insert error:', error.message);
  }

  const db = readDb();
  const buyer = {
    id: payload.id || createId('buy'),
    name: payload.name,
    company: payload.company,
    country: payload.country || 'China',
    email: payload.email,
    status: payload.status || 'active',
    verificationLevel: payload.verificationLevel || 'identity-verified',
    createdAt: new Date().toISOString()
  };
  db.buyers.push(buyer);
  writeDb(db);
  return buyer;
};

const listProducts = async () => {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (!error) return data;
    console.error('Supabase products read error:', error.message);
  }

  return readDb().products;
};

const createProduct = async (payload) => {
  if (hasSupabase && supabase) {
    const entity = {
      id: payload.id || createId('prod'),
      supplier_id: payload.supplierId,
      name: payload.name,
      category: payload.category,
      location: payload.location || 'Nigeria',
      quantity: payload.quantity,
      moq: payload.moq,
      quality: payload.quality || 'Export grade',
      certificates: payload.certificates || ['Certificate of origin'],
      status: payload.status || 'approved',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('products').insert(entity).select().single();
    if (!error) return data;
    console.error('Supabase products insert error:', error.message);
  }

  const db = readDb();
  const product = {
    id: payload.id || createId('prod'),
    supplierId: payload.supplierId,
    name: payload.name,
    category: payload.category,
    location: payload.location || 'Nigeria',
    quantity: payload.quantity,
    moq: payload.moq,
    quality: payload.quality || 'Export grade',
    certificates: payload.certificates || ['Certificate of origin'],
    status: payload.status || 'approved',
    createdAt: new Date().toISOString()
  };
  db.products.push(product);
  writeDb(db);
  return product;
};

const listRfqs = async () => {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from('rfqs').select('*');
    if (!error) return data;
    console.error('Supabase RFQs read error:', error.message);
  }

  return readDb().rfqs;
};

const createRfq = async (payload) => {
  if (hasSupabase && supabase) {
    const entity = {
      id: payload.id || createId('rfq'),
      buyer_id: payload.buyerId,
      product: payload.product,
      quantity: payload.quantity,
      destination: payload.destination,
      quality: payload.quality || 'Export grade',
      delivery: payload.delivery || 'CIF',
      deadline: payload.deadline,
      status: payload.status || 'open',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('rfqs').insert(entity).select().single();
    if (!error) return data;
    console.error('Supabase rfq insert error:', error.message);
  }

  const db = readDb();
  const rfq = {
    id: payload.id || createId('rfq'),
    buyerId: payload.buyerId,
    product: payload.product,
    quantity: payload.quantity,
    destination: payload.destination,
    quality: payload.quality || 'Export grade',
    delivery: payload.delivery || 'CIF',
    deadline: payload.deadline,
    status: payload.status || 'open',
    createdAt: new Date().toISOString()
  };
  db.rfqs.push(rfq);
  writeDb(db);
  return rfq;
};

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nexa-trade-api',
    database: hasSupabase ? 'supabase' : 'mock-json',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/schema', (req, res) => {
  res.json({
    entities: {
      suppliers: ['id', 'name', 'company', 'country', 'verificationLevel', 'status'],
      buyers: ['id', 'name', 'company', 'country', 'verificationLevel', 'status'],
      products: ['id', 'supplierId', 'name', 'category', 'location', 'quantity', 'moq', 'quality', 'certificates', 'status'],
      rfqs: ['id', 'buyerId', 'product', 'quantity', 'destination', 'quality', 'delivery', 'deadline', 'status'],
      verificationRequests: ['id', 'entityType', 'entityId', 'status', 'notes']
    }
  });
});

app.get('/api/dashboard-summary', async (req, res) => {
  const db = readDb();
  const suppliers = await listSuppliers();
  const buyers = await listBuyers();
  const products = await listProducts();
  const rfqs = await listRfqs();

  res.json({
    totalSuppliers: suppliers.length,
    totalBuyers: buyers.length,
    totalProducts: products.length,
    totalRFQs: rfqs.length,
    verifiedSuppliers: suppliers.filter((supplier) => supplier.verificationLevel === 'export-ready' || supplier.verification_level === 'export-ready').length,
    openMatches: rfqs.filter((rfq) => rfq.status === 'open').length
  });
});

app.get('/api/suppliers', async (req, res) => {
  const suppliers = await listSuppliers();
  res.json(suppliers);
});

app.post('/api/suppliers', async (req, res) => {
  const supplier = await createSupplier(req.body);
  res.status(201).json(supplier);
});

app.get('/api/buyers', async (req, res) => {
  const buyers = await listBuyers();
  res.json(buyers);
});

app.post('/api/buyers', async (req, res) => {
  const buyer = await createBuyer(req.body);
  res.status(201).json(buyer);
});

app.get('/api/products', async (req, res) => {
  const products = await listProducts();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = await createProduct(req.body);
  res.status(201).json(product);
});

app.get('/api/rfqs', async (req, res) => {
  const rfqs = await listRfqs();
  res.json(rfqs);
});

app.post('/api/rfqs', async (req, res) => {
  const rfq = await createRfq(req.body);
  res.status(201).json(rfq);
});

app.get('/api/rfqs/:id/matches', async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const rfq = db.rfqs.find((item) => item.id === id);

  if (!rfq) {
    return res.status(404).json({ message: 'RFQ not found' });
  }

  const products = await listProducts();
  const suppliers = await listSuppliers();

  const matches = products.filter((product) => {
    const productNameMatch = product.name.toLowerCase().includes(rfq.product.toLowerCase());
    const categoryMatch = product.category.toLowerCase().includes(rfq.product.toLowerCase());
    const sameCountry = product.location.toLowerCase().includes('nigeria');
    return (productNameMatch || categoryMatch) && sameCountry;
  }).map((product) => {
    const supplier = suppliers.find((item) => item.id === product.supplierId);
    return {
      productId: product.id,
      supplierId: supplier?.id,
      supplierName: supplier?.company || 'Verified supplier',
      productName: product.name,
      quantity: product.quantity,
      moq: product.moq,
      quality: product.quality,
      location: product.location,
      certificateStatus: product.certificates.length ? 'available' : 'pending'
    };
  });

  res.json({ rfq, matches });
});

app.get('/api/verification-requests', (req, res) => {
  const db = readDb();
  res.json(db.verificationRequests);
});

app.post('/api/verification-requests', (req, res) => {
  const db = readDb();
  const request = {
    id: createId('ver'),
    entityType: req.body.entityType,
    entityId: req.body.entityId,
    status: req.body.status || 'pending',
    notes: req.body.notes || 'Waiting for review',
    createdAt: new Date().toISOString()
  };

  db.verificationRequests.push(request);
  writeDb(db);
  res.status(201).json(request);
});

app.post('/api/admin/verification-requests/:id/approve', (req, res) => {
  const db = readDb();
  const request = db.verificationRequests.find((item) => item.id === req.params.id);

  if (!request) {
    return res.status(404).json({ message: 'Verification request not found' });
  }

  request.status = 'approved';
  request.reviewedAt = new Date().toISOString();

  if (request.entityType === 'supplier') {
    const supplier = db.suppliers.find((item) => item.id === request.entityId);
    if (supplier) supplier.verificationLevel = 'export-ready';
  }

  if (request.entityType === 'buyer') {
    const buyer = db.buyers.find((item) => item.id === request.entityId);
    if (buyer) buyer.verificationLevel = 'verified';
  }

  writeDb(db);
  res.json(request);
});

app.listen(port, () => {
  console.log(`NEXA API is running on http://localhost:${port}`);
  if (hasSupabase) {
    console.log('Supabase connection detected. Backend ready for live project data.');
  } else {
    console.log('Supabase credentials not found. Falling back to local/mock data.');
  }
});
