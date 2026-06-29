
/** Only gmail.com addresses are accepted for customer login. */
export const GMAIL_DOMAIN = "gmail.com";

export function isGmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain === GMAIL_DOMAIN;
}