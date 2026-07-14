/**
 * Generic debounce — delays invoking `fn` until `wait` ms after the last call.
 * Each new call within the window cancels the previous pending invocation.
 * Returns a wrapper that also exposes a `.cancel()` method for cleanup.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

/** Default debounce interval for reorder mutations (ms) */
export const REORDER_DEBOUNCE_MS = 300;
