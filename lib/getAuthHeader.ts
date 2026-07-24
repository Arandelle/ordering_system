const MAYA_PUBLIC_KEY = process.env.MAYA_PUBLIC_KEY;

if (!MAYA_PUBLIC_KEY) {
  throw new Error("MAYA_PUBLIC_KEY is not defined in environment variables!");
}

/** Basic auth using the public API key — used by the Checkout API. */
export function getAuthHeader() {
  const encoded = Buffer.from(`${MAYA_PUBLIC_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

/** Basic auth using the secret API key — used by the Payments API. */
export function getMayaSecretAuthHeader() {
  const secretKey = process.env.MAYA_SECRET_KEY;
  if (!secretKey) throw new Error("MAYA_SECRET_KEY is not defined in environment variables!");

  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

/** Basic auth using the QR PH public key — from the "Pay with Maya" application. */
export function getMayaQrAuthHeader() {
  const qrPublicKey = process.env.MAYA_QR_PUBLIC_KEY;
  if (!qrPublicKey) throw new Error("MAYA_QR_PUBLIC_KEY is not defined in environment variables!");

  const encoded = Buffer.from(`${qrPublicKey}:`).toString("base64");
  return `Basic ${encoded}`;
}