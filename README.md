# Harrison Ordering System

A full-stack ordering and admin system for branch-based food ordering. The system supports product browsing, branch inventory, customer checkout, admin management, promotions, vouchers, and Maya/COD payment flows.

For design decisions and engineering rules, read [ARCHITECTURE.md](./ARCHITECTURE.md).

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Next.js API routes
- MongoDB with Mongoose
- Better Auth
- Maya payment integration
- Inngest

## Core Capabilities

- Customer product browsing by category and branch availability
- Branch-specific inventory validation and reservation
- Customer checkout for COD and Maya
- Promo-card benefits and voucher redemption
- Product-level and order-level promotions
- Admin management screens for products, branches, categories, inventory, orders, and promotions
- Order snapshots for historical product, branch, payment, and discount details

## Project Structure

```txt
app/
  Next.js routes, API routes, admin/customer UI

components/
  Shared UI components

contexts/
  React context providers

hooks/
  Shared React hooks

inngest/
  Background event/workflow integration

lib/
  Runtime domain logic, auth helpers, database helpers, promotion logic

models/
  Mongoose schemas

services/
  Cross-feature services and customer benefit helpers

types/
  Shared TypeScript types and constants
```

## Important Architecture Rules

Backend routes are the source of truth for production-sensitive behavior.

Do not trust the frontend for:

- Product prices
- Inventory availability
- Discount eligibility
- Voucher redemption amount
- Tax and final order totals
- Payment status
- Order status transitions
- Admin permissions

Checkout pricing follows this order:

```txt
cart items from database
-> original subtotal
-> product discount promotions
-> promo-card discount
-> order discount promotions
-> voucher redemption
-> tax and final total
-> order snapshot
```

Promotion configuration and promotion application are separate:

- Admin validation/configuration lives near admin/API validation code.
- Runtime checkout application lives under `lib/*-promotions/`.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Run TypeScript check:

```bash
npx tsc --noEmit
```

On this Windows workspace, full lint/typecheck may fail with:

```txt
EPERM: operation not permitted, lstat 'C:\Test'
```

When that happens, use targeted code inspection and `git diff --check`, then verify in a less restricted environment before shipping.

## Environment

Use `.env.local` for local configuration. Do not commit secrets.

Common configuration includes:

- MongoDB connection string
- Better Auth configuration
- Maya payment keys
- Email provider settings
- Public application URL

Check `.env.example` for the expected shape.

## Production-Sensitive Areas

Be extra careful when changing:

- Checkout routes
- Payment callback/webhook routes
- Inventory reservation logic
- Promotion and voucher application
- Order status transitions
- Authentication and admin authorization
- Mongoose model fields used by existing orders

Before merging changes in these areas, review [ARCHITECTURE.md](./ARCHITECTURE.md#before-changing-code).
