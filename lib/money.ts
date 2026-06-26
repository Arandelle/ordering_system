/**
 * Money utility — centavo-based arithmetic for Philippine Peso (PHP).
 *
 * JavaScript IEEE 754 floats can't represent some decimal values exactly
 * (e.g. 0.1 + 0.2 = 0.30000000000000004). For monetary calculations this
 * is unacceptable.
 *
 * Strategy: convert peso amounts to centavos (integer minor units) before
 * any arithmetic, then convert back to pesos only for display or API output.
 *
 * PHP uses 100 centavos per peso, so ₱100.50 = 10050 centavos.
 * All internal calculations operate on integers, eliminating float drift.
 */

const CENTAVOS_PER_PESO = 100;

/** Convert a peso amount to centavos (integer). Handles float imprecision. */
export function toCentavos(pesoAmount: number): number {
  // Math.round eliminates float artifacts: e.g. 100.50 * 100 might
  // produce 10049.999999999998 instead of 10050
  return Math.round(pesoAmount * CENTAVOS_PER_PESO);
}

/** Convert centavos back to a peso amount for display/API output. */
export function fromCentavos(centavoAmount: number): number {
  return centavoAmount / CENTAVOS_PER_PESO;
}

/** Add two peso amounts using centavo arithmetic, return in pesos. */
export function addMoney(a: number, b: number): number {
  return fromCentavos(toCentavos(a) + toCentavos(b));
}

/** Subtract two peso amounts using centavo arithmetic, return in pesos. */
export function subtractMoney(a: number, b: number): number {
  return fromCentavos(toCentavos(a) - toCentavos(b));
}

/** Multiply a peso amount by a factor using centavo arithmetic, return in pesos.
 *  Used for quantity × unit price and percentage discounts. */
export function multiplyMoney(pesoAmount: number, factor: number): number {
  return fromCentavos(Math.round(toCentavos(pesoAmount) * factor));
}

/** Round a peso value to 2 decimal places using centavo conversion.
 *  Replaces the old `Number(value.toFixed(2))` pattern — this is
 *  mathematically equivalent but avoids the float→string→float round-trip. */
export function roundMoney(value: number): number {
  return fromCentavos(toCentavos(value));
}

/** Clamp a peso value so it never goes below zero, using centavo arithmetic. */
export function clampMoneyMin(value: number, min: number = 0): number {
  return fromCentavos(Math.max(toCentavos(value), toCentavos(min)));
}

/** Return the smaller of two peso amounts, using centavo comparison. */
export function minMoney(a: number, b: number): number {
  return fromCentavos(Math.min(toCentavos(a), toCentavos(b)));
}
