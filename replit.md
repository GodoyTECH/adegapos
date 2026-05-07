# Workspace

## Overview

**Adega Smart POS** — Full-stack POS system for Brazilian liquor stores. pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Wouter routing, TanStack Query, react-hook-form, recharts, shadcn/ui
- **Auth**: JWT stored in localStorage (`adega_token`), bcryptjs hashes

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### Artifacts

| Artifact | Path | Description |
|---|---|---|
| `adega-pos` | `/` | React + Vite frontend |
| `api-server` | `/api` | Express 5 + Drizzle ORM backend |

### User Roles

- **admin** — Full access: dashboard, POS, products, stock, sales, cash, reports, users
- **manager** — Dashboard, POS, products, stock, sales, cash, reports
- **cashier** — POS and cash session only

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@adega.com | 123456 |
| Gerente | gerente@adega.com | 123456 |
| Caixa | caixa@adega.com | 123456 |

## Pages

- `/login` — Auth page with demo credentials
- `/dashboard` — KPI cards + recharts bar/donut + top products + low stock list
- `/pos` — Full POS with barcode scanning, cart, payment methods (cash/pix/debit_card/credit_card), composite products
- `/products` — CRUD product catalog with create/edit modal (simple & composite types)
- `/stock` — Stock levels table with entry/adjustment/loss movement modals
- `/sales` — Sales history with filters
- `/cash` — Open/close cash sessions, sangria (withdrawal) / suprimento (supply)
- `/reports` — Tabs: sales / products / payment methods (recharts)
- `/users` — User management: create/edit/disable (admin only)

## API Routes

All routes under `/api` prefix:

- `POST /api/auth/login` — Returns JWT + user
- `GET /api/auth/me` — Current user
- `GET/POST /api/categories`
- `GET/POST/PATCH/DELETE /api/products`
- `GET /api/stock`, `POST /api/stock/movements`
- `GET/POST /api/sales`
- `GET/POST /api/cash/sessions`, `POST /api/cash/sessions/:id/close`, `POST /api/cash/sessions/:id/movements`
- `GET /api/dashboard/summary|by-hour|top-products|payment-methods|by-category|low-stock`
- `GET/POST/PATCH /api/users`
- `GET /api/reports/sales|products|payment-methods`

## Database Seed

Seeded via `pnpm --filter @workspace/db run seed`:
- 3 users (admin/gerente/caixa, password: 123456)
- 12 categories (Gin, Whisky, Vodka, Cachaça, Cerveja, Vinho, etc.)
- 13 simple products with barcodes and stock levels
- 3 composite products (Copão Gin Morango, Copão Chanceler Energético, Combo)

## Important Files

- `artifacts/adega-pos/src/App.tsx` — All routes and auth gate
- `artifacts/adega-pos/src/lib/auth.tsx` — AuthProvider with JWT localStorage + token getter
- `artifacts/adega-pos/src/components/layout/app-layout.tsx` — Sidebar with role-based nav
- `artifacts/api-server/src/routes/index.ts` — All route registrations
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for codegen)
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
