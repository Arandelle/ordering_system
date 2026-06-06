# Architecture Guide

This document explains the main design decisions in this ordering system. Use it when adding features, reviewing code, or deciding where business logic should live.

## Project Purpose

This repo is a Next.js ordering and admin system for branch-based food ordering. It handles customer ordering, admin management, branch inventory, promotions, vouchers, and payment workflows.

The most important design rule is simple:

```txt
The frontend can preview behavior, but the backend must decide final business truth.
```

That applies especially to prices, discounts, inventory, payment status, order status, and permissions.

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Next.js API routes
- MongoDB
- Mongoose
- Better Auth
- Maya payment integration
- Inngest for background workflow/event dispatch

## Folder Responsibilities

```txt
app/
  UI routes, API routes, customer/admin screens

components/
  Shared UI primitives and reusable components

lib/
  Runtime domain logic, shared services, infrastructure helpers

models/
  Mongoose schemas and persistence models

services/
  Cross-feature service helpers, especially customer benefits and side effects

types/
  Shared TypeScript contracts and constants

inngest/
  Background workflow/event definitions
```

Keep business logic out of components when it affects money, inventory, auth, or order status. UI should call backend routes or domain helpers instead of becoming the source of truth.

## Backend Authority Rules

The backend must recompute sensitive values even when the frontend already calculated or displayed them.

Backend-authoritative areas:

- Product price used for checkout
- Branch inventory availability
- Store open or closed state
- Promo-card eligibility
- Product discount eligibility
- Order discount eligibility
- Voucher redemption amount
- Tax and final total
- Payment status
- Order status transitions
- Admin permissions

Frontend previews are allowed, but they are not trusted during checkout.

## Checkout Pricing Pipeline

Checkout pricing should follow one consistent order:

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

Why product discounts come first:

- They belong to specific product lines.
- They change the discountable item subtotal.
- Whole-order discounts should run after product-level discounts.

Why vouchers come late:

- Vouchers behave like a final customer benefit applied after promotional pricing.
- Voucher redemption must be capped against the remaining payable amount.

## Promotion Architecture

Promotions are split into two responsibilities:

```txt
admin validation/configuration
!=
runtime checkout application
```

Admin validation answers:

- Is this saved config valid?
- Are required fields present?
- Are dates, discount values, and limits sane?

Runtime application answers:

- Is this promotion active right now?
- Is the store schedule eligible?
- Is the redemption limit still available?
- Which products or order totals qualify?
- What amount should be discounted?

Current promotion runtime folders:

```txt
lib/order-promotions/
  Whole-order promotion application, calculation, schedule, and estimates

lib/product-promotions/
  Product-level promotion products, validation, and checkout application

lib/promotions/
  Shared promotion calculation, validation, and schedule helpers
```

## Product Discount Strategy

Product discounts use a strategy map for calculation:

```txt
percentage -> calculate percentage of line subtotal
fixed      -> subtract fixed amount capped at line subtotal
```

The main idea of the Strategy Pattern is to keep each discount calculation behind a common interface. Checkout does not need to know how every discount type works. It asks the strategy for the discount amount.

This keeps the route small and makes future discount types easier to add.

## Order Discount Strategy

Order discounts run after product discounts and promo-card adjustments. They apply to the remaining order-level discountable amount.

Order discounts should not be mixed with product discounts or vouchers because each one answers a different business question:

- Product discount: Which item is discounted?
- Order discount: Is the whole order eligible?
- Voucher: How much customer benefit can be redeemed?

## Inventory and Branch Rules

Inventory is branch-specific. Checkout must validate inventory for the selected branch before order persistence and reservation.

Important rules:

- Do not trust cart quantity from the client without checking inventory.
- Do not use global product availability when branch inventory matters.
- Reservations should be idempotent where possible.
- Order item snapshots should preserve product details at time of order.

When changing checkout, always ask:

```txt
What happens if stock changes while the customer is checking out?
```

## Payment Flow Rules

The frontend must never mark an order as paid by itself.

Payment-sensitive rules:

- Payment status must be confirmed by backend-controlled callbacks, webhooks, or reconciliation.
- Webhook handlers should be idempotent.
- Duplicate payment attempts should be prevented or safely handled.
- Pending payment orders need expiry and recovery behavior.
- Side effects should happen after successful database commit.

Good payment code assumes the user may close the browser, retry, lose network, or return late from the payment provider.

## Order History and Snapshots

Orders must preserve historical details. Do not rely only on current product, promo, or branch records when displaying old orders.

Examples of historical snapshots:

- Product name and price in `items`
- Branch snapshot
- Promo-card discount code
- Product discount promotion snapshots
- Order discount promotion name/id
- Voucher discount amount
- Payment reference number

This protects old orders when admins later rename products, disable promotions, or change branch details.

## Authentication and Authorization

Use Better Auth helpers for customer/admin identity. Protected operations must check auth before touching sensitive data.

Rules:

- Admin API routes must require admin authorization.
- Customer-only behavior should verify the authenticated customer where needed.
- Public guest flows should be explicit and narrow.
- Do not infer permissions from frontend navigation.

## Error Handling

Prefer clear user-facing errors for expected failures:

- Cart is empty
- Product is out of stock
- Store is closed
- Promotion reached redemption limit
- Voucher amount is invalid
- Payment gateway failed

Avoid exposing internal errors, stack traces, secrets, or raw provider responses to users.

## Patterns Used

### Domain Service

Runtime business logic lives in focused service files under `lib/`.

Use when:

- Logic is shared by multiple routes
- Logic touches money, inventory, or eligibility
- A route is becoming too large

### Strategy Pattern

Used when one business operation has multiple interchangeable algorithms.

Examples:

- Percentage discount vs fixed discount
- Future payment provider handlers
- Future order status transition rules

### Transaction Script

Checkout is mostly a transaction script: a clear sequence of steps that must happen in order.

Example:

```txt
validate request
-> authenticate
-> resolve branch
-> resolve cart
-> compute discounts
-> redeem voucher
-> persist order
-> reserve inventory
-> commit
-> dispatch side effects
```

This is acceptable because checkout is a business workflow with strict ordering.

### Idempotency

Use idempotency when the same operation may run more than once.

Important areas:

- Payment webhooks
- Inventory reservation retries
- Order status updates
- Payment retry flows

### Outbox Pattern

Outbox is for reliable side effects after a database commit.

Use it for:

- Webhook delivery
- Email notification
- Analytics event
- External system sync

Do not use it for synchronous pricing calculation. Pricing must happen before the order is saved.

## Before Changing Code

Ask these questions before editing:

- What layer owns this decision?
- Is this frontend preview or backend truth?
- Does branch inventory matter?
- Can this change historical order data?
- What happens if the user clicks twice?
- What happens if the request fails halfway?
- What happens if the database is slow?
- What happens if payment succeeds but the app closes?
- Does this need a transaction?
- Does this need idempotency?
- Does this expose secrets or internal errors?

## Review Checklist

Before merging a production-sensitive change:

- Backend validates incoming data.
- Protected routes check authentication and authorization.
- Money is computed on the backend.
- Inventory is checked for the selected branch.
- Order snapshots preserve historical details.
- Payment state is backend-confirmed.
- Duplicate requests are considered.
- Error messages are clear but not overly internal.
- Tests or targeted verification were run.
- Unrelated files were not changed.

## Future Improvements

These are useful directions when the system grows:

- Add dedicated tests for promotion calculation and checkout totals.
- Add idempotency keys for checkout/payment retries.
- Add a payment reconciliation job for pending orders.
- Add an outbox table/collection for reliable external side effects.
- Add clearer order total breakdowns in customer/admin UI.
- Add stricter typed response contracts for API routes.
- Add more focused services around order status transitions.
