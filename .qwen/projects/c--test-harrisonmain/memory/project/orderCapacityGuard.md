---
name: Order capacity guard
 Order limiting feature
type: project
scope: project (this-project-only)
description: Auto + manual order capacity limiting for a single-rider ordering system. Branches have maxActiveOrders and isBusy flag, Settings has globalMaxActiveOrders. Blocks checkout (no payment) if at capacity. Soft "high demand" overlay on menu and checkout page.
---

## Rule/fact

 Order capacity limiting with `maxActiveOrders` and `isBusy` per branch and `globalMaxActiveOrders` on global Settings.

**Why:** 1 rider system; prevents order flooding / bad reviews if delayed orders aren't accepted. **How to apply:** Applied to both Maya and COD checkout route before payment processing. Also used by customer-facing capacity API endpoint.

- `GET /api/customer/branch/capacity?branchId=...` — Returns `{canAcceptOrders, boolean, reason?, message? }` for frontend high-demand overlay. Polls every 60s.
- `useBranchCapacity` hook — react-query-based hook polling capacity every 60s.
- `HighDemandOverlay` component (ProductCard) — lighter overlay (30% opacity vs StoreClosedOverlay's 60% + amber "High Demand — Check back shortly" badge. Add-to-cart button disabled.
- High-demand banner (CartList checkout) — amber-50 banner with clock icon + "We're Experiencing High Demand" message. Checkout submit button disabled when at capacity.
- Admin `isBusy` toggle + `maxActiveOrders` input ( BranchModal + amber card with Truck icon, "Busy" badge in stores table + "Busy" count in stats
 **Why:** Admin can manually pause orders for operational issue (overload, kitchen equipment). etc. **How to apply:** Superadmin toggle `isBusy` + set `maxActiveOrders` per branch. Global setting also configurable in settings page.
- `globalMaxActiveOrders` input in Settings admin page with explanation text. **Why:** Branch-specific limit overrides global fallback; allows per-branch scale when more riders are added.
- Branch API `PUT /branch/[id]` — now accepts `isBusy` + `maxActiveOrders` in update payload. Branch `POST /branch` — Zod schema updated to include new fields.
- Settings API `POST /settings` — automatically handles `globalMaxActiveOrders` via `$set: body` (no route changes needed).
- `pending_payment` excluded from capacity count — those may expire unpaid; shouldn't block real orders.
- Order expiry Inngest still works — auto-releases capacity when orders expire.
