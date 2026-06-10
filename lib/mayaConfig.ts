const MAYA_CHECKOUT_PATH = "/checkout/v1/checkouts";

const MAYA_API_HOSTS = {
  sandbox: "https://pg-sandbox.paymaya.com",
  production: "https://pg.maya.ph",
} as const;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getMayaCheckoutUrl(): string {
  const explicitCheckoutUrl = process.env.MAYA_CHECKOUT_API_URL?.trim();
  if (explicitCheckoutUrl) return explicitCheckoutUrl;

  const configuredApiHost = process.env.MAYA_API_HOST?.trim();
  const apiHost =
    configuredApiHost ??
    (process.env.NODE_ENV === "production"
      ? MAYA_API_HOSTS.production
      : MAYA_API_HOSTS.sandbox);

  return `${trimTrailingSlash(apiHost)}${MAYA_CHECKOUT_PATH}`;
}
