# NEXA TRADE

Nigeria → Global B2B Trade Platform

NEXA Trade connects verified Nigerian suppliers with international buyers through a demand-driven workflow:

**VERIFY → MATCH → TRANSACT → TRACK**

## MVP prototype

This repository contains a responsive web-first prototype with:

- Supplier and buyer entry points
- Product discovery marketplace
- Buyer RFQ creation
- Supplier verification levels
- Supplier and buyer dashboard previews
- Admin moderation preview
- Matching-oriented product and request data

## Run locally

Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The current MVP uses local sample data and does not process real payments, identity documents, or export documentation. Those integrations should be added only with appropriate compliance, security, and professional review.

## Structure

- `apps/frontend` — Next.js web application
- `apps/backend` — lightweight API health-check scaffold
