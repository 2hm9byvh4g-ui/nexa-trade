import express from 'express';
import cors from 'cors';
import { readDb, writeDb, createId } from './data/mockDb.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nexa-trade-api', timestamp: new Date().toISOString() });
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

app.get('/api/dashboard-summary', (req, res) => {
  const db = readDb();
  res.json({
    totalSuppliers: db.suppliers.length,
    totalBuyers: db.buyers.length,
    totalProducts: db.products.length,
    totalRFQs: db.rfqs.length,
    verifiedSuppliers: db.suppliers.filter((supplier) => supplier.verificationLevel === 'export-ready').length,
    openMatches: db.rfqs.filter((rfq) => rfq.status === 'open').length
  });
});

app.get('/api/suppliers', (req, res) => {
  const db = readDb();
  res.json(db.suppliers);
});

app.post('/api/suppliers', (req, res) => {
  const db = readDb();
  const supplier = {
    id: createId(),
    name: req.body.name,
    company: req.body.company,
    country: req.body.country || 'Nigeria',
    email: req.body.email,
    status: req.body.status || 'active',
    verificationLevel: req.body.verificationLevel || 'identity-verified',
    createdAt: new Date().toISOString()
  };

  db.suppliers.push(supplier);
  writeDb(db);
  res.status(201).json(supplier);
});

app.get('/api/buyers', (req, res) => {
  const db = readDb();
  res.json(db.buyers);
});

app.post('/api/buyers', (req, res) => {
  const db = readDb();
  const buyer = {
    id: createId(),
    name: req.body.name,
    company: req.body.company,
    country: req.body.country || 'China',
    email: req.body.email,
    status: req.body.status || 'active',
    verificationLevel: req.body.verificationLevel || 'identity-verified',
    createdAt: new Date().toISOString()
  };

  db.buyers.push(buyer);
  writeDb(db);
  res.status(201).json(buyer);
});

app.get('/api/products', (req, res) => {
  const db = readDb();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = readDb();
  const product = {
    id: createId(),
    supplierId: req.body.supplierId,
    name: req.body.name,
    category: req.body.category,
    location: req.body.location || 'Nigeria',
    quantity: req.body.quantity,
    moq: req.body.moq,
    quality: req.body.quality || 'Export grade',
    certificates: req.body.certificates || ['Certificate of origin'],
    status: req.body.status || 'approved',
    createdAt: new Date().toISOString()
  };

  db.products.push(product);
  writeDb(db);
  res.status(201).json(product);
});

app.get('/api/rfqs', (req, res) => {
  const db = readDb();
  res.json(db.rfqs);
});

app.post('/api/rfqs', (req, res) => {
  const db = readDb();
  const rfq = {
    id: createId(),
    buyerId: req.body.buyerId,
    product: req.body.product,
    quantity: req.body.quantity,
    destination: req.body.destination,
    quality: req.body.quality || 'Export grade',
    delivery: req.body.delivery || 'CIF',
    deadline: req.body.deadline,
    status: req.body.status || 'open',
    createdAt: new Date().toISOString()
  };

  db.rfqs.push(rfq);
  writeDb(db);
  res.status(201).json(rfq);
});

app.get('/api/rfqs/:id/matches', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const rfq = db.rfqs.find((item) => item.id === id);

  if (!rfq) {
    return res.status(404).json({ message: 'RFQ not found' });
  }

  const matches = db.products.filter((product) => {
    const productNameMatch = product.name.toLowerCase().includes(rfq.product.toLowerCase());
    const categoryMatch = product.category.toLowerCase().includes(rfq.product.toLowerCase());
    const sameCountry = product.location.toLowerCase().includes('nigeria');
    return (productNameMatch || categoryMatch) && sameCountry;
  });

  const result = matches.map((product) => {
    const supplier = db.suppliers.find((item) => item.id === product.supplierId);

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

  res.json({ rfq, matches: result });
});

app.get('/api/verification-requests', (req, res) => {
  const db = readDb();
  res.json(db.verificationRequests);
});

app.post('/api/verification-requests', (req, res) => {
  const db = readDb();
  const request = {
    id: createId(),
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
});
