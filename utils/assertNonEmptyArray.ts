
/**
 * Checks whether a value is a non-empty array.
 * @param value - value to check
 */
export function isValidNonEmptyArray<T = unknown>(
  value: unknown,
): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

export function assertNonEmptyArray<T = unknown>(
  value: unknown,
  message = "Array is required and must not be empty",
): asserts value is T[] {
  if (!isValidNonEmptyArray(value)) {
    throw new Error(message);
  }
}

