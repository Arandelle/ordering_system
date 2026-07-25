import { NotificationRefType } from "@/types/notification";

/**
 * Resolves a notification's refType + refId into an admin route path.
 * Returns null for types that have no dedicated detail page.
 */
export function getNotificationRoute(
  refType: NotificationRefType,
  refId?: string,
): string | null {
  switch (refType) {
    case "Order":
      return refId ? `/orders/${refId}` : "/orders";
    case "Inventory":
      return "/inventories";
    case "Reservation":
      return "/reservations";
    case "Product":
      return refId ? `/products/${refId}/edit` : "/products";
    case "Branch":
    case "Staff":
    case "System":
    default:
      return null;
  }
}
