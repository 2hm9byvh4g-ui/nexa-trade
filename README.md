# NEXA TRADE

Nigeria → Global B2B Trade Platform

NEXA Trade connects verified Nigerian suppliers with international buyers through a demand-driven workflow:

VERIFY → MATCH → TRANSACT → TRACK

## Current state

This repository now includes:

- Landing page and conversion-focused marketing site
- Supplier and buyer auth flow UI
- Supplier product listing flow
- Buyer RFQ posting and matching preview
- Admin verification dashboard
- Express API with mock/seeded trade entities

## Recommended next production upgrade

The next step is to move from mock data to a real database-backed platform using PostgreSQL + Prisma + JWT auth.

## Quick start

### Backend

```bash
cd apps/backend
npm install
npm run dev
```

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Open:

- http://localhost:3000
- http://localhost:3000/auth
- http://localhost:3000/dashboard
- http://localhost:3000/products
- http://localhost:3000/buying-requests
- http://localhost:3000/admin

## API summary

- GET /health
- GET /api/dashboard-summary
- GET /api/suppliers
- POST /api/suppliers
- GET /api/buyers
- POST /api/buyers
- GET /api/products
- POST /api/products
- GET /api/rfqs
- POST /api/rfqs
- GET /api/rfqs/:id/matches
- GET /api/verification-requests
- POST /api/verification-requests
- POST /api/admin/verification-requests/:id/approve

## Important note

This is still a prototype system and not yet production-ready for payment, customs, legal, identity verification, or regulated trade workflows. Those elements must be integrated with appropriate compliance and professional review.
