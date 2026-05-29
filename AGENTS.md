# AGENTS.md

## Project Overview

This is a food ordering system built with:

* Next.js App Router
* TypeScript
* Mongoose / MongoDB
* Tailwind CSS
* TanStack Query
* Maya / PayMaya payment integration
* Cookie/JWT-based authentication
* Role-based admin access

The system supports customer ordering, branch selection, inventory, checkout, Maya payments, admin order management, and order status workflows.

## Main Rule

Act like a senior full-stack engineer reviewing production code.

Do not only make the code work. Make it safe, maintainable, type-safe, and production-ready.

Before changing code, understand the existing patterns first.

## Coding Style

* Use TypeScript strictly.
* Avoid `any` unless there is a strong reason.
* Prefer reusable helpers over repeated logic.
* Prefer server-side validation before trusting client input.
* Keep components small and focused.
* Use clear naming.
* Avoid over-engineering.
* Follow the existing folder structure and naming conventions.
* Use Tailwind classes for UI styling.
* Do not introduce new libraries unless necessary.

## Next.js Rules

* Use App Router conventions.
* Keep server logic inside API routes, server actions, or server utilities.
* Do not access database logic directly inside client components.
* Use `NextRequest` and `NextResponse` for route handlers.
* Always return proper HTTP status codes.
* Handle errors consistently.
* Validate route params and request bodies.
* Avoid unnecessary `use client`.

## Mongoose / MongoDB Rules

* Always call `connectDB()` before database operations.
* Validate ObjectId before using `findById`.
* Avoid unnecessary `.save()` after read-only operations.
* Use `.lean()` for read-only queries when document methods are not needed.
* Use indexes for fields used in frequent queries.
* Be careful with race conditions in inventory/order/payment flows.
* Prefer atomic updates for stock and reservation logic.
* Never trust frontend-calculated totals. Recalculate totals server-side.

## Ordering System Business Rules

Important order statuses:

* pending
* paid
* preparing
* ready
* dispatched
* completed
* cancelled
* failed
* expired

Rules:

* Do not allow invalid status transitions.
* Centralize status transition logic.
* Maya-paid orders should not be manually marked paid unless verified.
* COD and Maya flows may have different allowed actions.
* Always check branch availability, store status, product availability, and inventory before creating an order.
* Checkout minimum order amount is ₱100.
* Do not rely only on frontend checks.

## Inventory Rules

Inventory is per branch.

Product definitions are centralized, but stock belongs to inventory records.

Expected inventory shape:

```ts
{
  product: ObjectId;
  branch: ObjectId;
  quantity: number;
  reorderLevel: number;
  updatedBy?: ObjectId;
}
```

Rules:

* Do not store branch stock directly on Product.
* Use product + branch as a unique pair.
* Prevent negative stock.
* Handle concurrent orders safely.
* If deducting stock at pending state, make sure abandoned/expired orders release stock or reservations.

## Payment Rules

Maya payment logic must be treated as sensitive.

* Verify webhook payloads properly.
* Keep webhook handlers idempotent.
* Do not double-update orders.
* Do not double-deduct stock.
* Store payment reference numbers clearly.
* Never mark an order paid from client-side confirmation only.
* Webhook should be the source of truth for final payment status.
* Failed, cancelled, and expired payments should be handled explicitly.

## Authentication / Authorization Rules

* Protect admin routes.
* Validate JWT/cookies server-side.
* Enforce role-based access.
* Do not trust role or branch from client payload.
* If branch assignment is stored in token, consider DB freshness issues.
* For sensitive admin actions, fetch current staff data from DB.

Admin roles:

* superadmin
* admin
* cashier

## API Rules

Every API route should consider:

* Authentication
* Authorization
* Input validation
* Database connection
* Error handling
* Correct status code
* Race condition risk
* Idempotency risk
* Logging/debuggability
* Security impact

Use this response pattern where appropriate:

```ts
return NextResponse.json(
  { error: "Message here" },
  { status: 400 }
);
```

## Frontend Rules

* Use TanStack Query hooks for server state.
* Keep local state only for UI state.
* Avoid duplicating backend business rules unless needed for UX.
* Backend must still enforce all important rules.
* Use loading, error, empty, and success states.
* Disable buttons during mutations.
* Prevent duplicate submissions.
* Keep forms accessible and clear.

## UI / Tailwind Rules

* Use clean responsive layouts.
* Prefer reusable components for repeated card, modal, button, badge, and form patterns.
* Keep Tailwind readable.
* Avoid huge class strings when a component abstraction is better.
* Use consistent spacing, radius, colors, and typography.
* Preserve existing design language.

## Security Checklist

Before finalizing changes, check:

* Can a user spoof this request?
* Can a user access another user's order?
* Can an admin access another branch's data incorrectly?
* Can stock become negative?
* Can payment be marked paid without webhook verification?
* Can the same webhook/order action run twice?
* Can invalid input crash the route?
* Can sensitive data leak to the client?

## Performance Checklist

Before finalizing changes, check:

* Is the query indexed?
* Are we fetching too much data?
* Should `.lean()` be used?
* Is pagination needed?
* Is this causing unnecessary rerenders?
* Is this duplicating network requests?
* Should this be cached or invalidated through TanStack Query?

## Testing / Verification

When making changes, suggest or run relevant checks:

```bash
npm run lint
npm run typecheck
npm run build
```

If tests exist:

```bash
npm test
```

If no tests exist, explain what manual verification should be done.

## Commit Message Style

Use clear commit messages:

```bash
feat: add branch-based inventory validation
fix: prevent duplicate Maya webhook processing
refactor: extract order status transition helper
chore: update checkout validation
```

Avoid vague messages like:

```bash
update code
fix bugs
changes
```

## How To Respond

When helping with a task:

1. Briefly explain the issue.
2. Make the smallest safe change.
3. Mention any production risk.
4. Suggest a senior-level improvement if applicable.

Do not rewrite large parts of the app unless asked.

## Senior Engineering Reminder

For every backend or payment-related change, consider:

* Rate limiting
* Rollback strategy
* Deployment risk
* Idempotency
* Database consistency
* Security
* Scalability
* Observability
