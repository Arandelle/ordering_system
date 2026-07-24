/** Full payment page — shows all enabled payment methods (card, QR, bank, etc.) */
const MAYA_CHECKOUT_PATH = "/checkout/v1/checkouts";

/** QR PH — goes directly to QR code payment, skipping the method list */
const MAYA_QR_PATH = "/payments/v1/qr/payments";

const MAYA_API_HOSTS = {
  sandbox: "https://pg-sandbox.paymaya.com",
  production: "https://pg.maya.ph",
} as const;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveApiHost(): string {
  const explicitHost = process.env.MAYA_API_HOST?.trim();
  return (
    explicitHost ??
    (process.env.NODE_ENV === "production"
      ? MAYA_API_HOSTS.production
      : MAYA_API_HOSTS.sandbox)
  );
}

/** Returns the Checkout API URL (full payment page with all methods). */
export function getMayaCheckoutUrl(): string {
  const explicitUrl = process.env.MAYA_CHECKOUT_API_URL?.trim();
  if (explicitUrl) return explicitUrl;

  return `${trimTrailingSlash(resolveApiHost())}${MAYA_CHECKOUT_PATH}`;
}

/** Returns the QR PH API URL (direct QR code payment). */
export function getMayaQrUrl(): string {
  const explicitUrl = process.env.MAYA_QR_API_URL?.trim();
  if (explicitUrl) return explicitUrl;

  return `${trimTrailingSlash(resolveApiHost())}${MAYA_QR_PATH}`;
}
