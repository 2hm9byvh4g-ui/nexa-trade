# NEXA TRADE

**From Nigerian Supply to Global Demand.**

`VERIFY → MATCH → TRANSACT → TRACK`

A B2B digital trade platform that connects verified Nigerian farmers, producers, processors and exporters with international buyers looking for Nigerian products.

> NEXA Trade helps international buyers discover, verify and source products from Nigerian suppliers — and helps Nigerian producers reach global markets.

## What you can do

- **Discover** Nigerian commodities in a live marketplace (hibiscus, sesame, ginger, cocoa, shea, cashew, and more)
- **Verify** suppliers by identity, business, product and export-readiness
- **Match** buyer requests to verified supply automatically
- **Quote** with RFQs, compare offers, and negotiate in-platform
- **Transact** through an order workflow with document checklists
- **Track** shipments and deal status
- **Analyze** demand with the export intelligence dashboard
- **Ask** the AI Trade Assistant about Nigerian export products and process

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19
- Tailwind CSS v4 + Radix UI
- Better Auth (email / password + OAuth)
- PostgreSQL in production, PGLite for local/dev
- Recharts for market intelligence
- xAI for the Trade Assistant

## Run locally

```bash
npm install
npm run dev
```

The app starts on port `8080`. Auth and the catalog seed are enabled; local development uses an in-memory Postgres (PGLite) so you can browse the marketplace, post buying requests, and use the dashboards without a cloud database.

### Production database

Set `DATABASE_URL` to a Postgres connection string. Migrations in `migrations/` run on `npm run build` and via `npm run db:migrate`.

Optional:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres (required in production) |
| `XAI_API_KEY` | Powers the AI Trade Assistant |
| `VITE_AUTH_ENABLED` | Keep `true` for accounts and per-user data |

Never commit secrets. Copy `.env.example` if you add one locally.

## Product surfaces

| Path | What it is |
|---|---|
| `/` | Landing — pitch, flow, featured commodities |
| `/marketplace` | Public product catalog |
| `/marketplace/:id` | Product detail + request a quote |
| `/requests` | Open buying requests |
| `/request` | Post “I want to buy” |
| `/suppliers` | Verified supplier directory |
| `/map` | Nigerian supply map |
| `/intelligence` | Export demand analytics |
| `/assistant` | AI Trade Assistant |
| `/dashboard` | Role-aware workspace (products, quotes, orders, documents, messages, verification) |
| `/admin` | Operator panel |

## Roles

1. **Nigerian supplier** — register, verify, list products, receive RFQs, complete orders
2. **International buyer** — register, post demand, match suppliers, request quotations, purchase
3. **Admin** — verify businesses, moderate listings, watch the trade pipeline

## License

MIT
