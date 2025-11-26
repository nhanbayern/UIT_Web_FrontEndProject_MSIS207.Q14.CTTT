/**
 * Production-ready Debounce Utility
 * Ensures API calls are throttled to prevent spam
 */

type DebounceCallback = (...args: any[]) => void | Promise<void>;

/**
 * Creates a debounced function that delays invoking callback until after
 * delay milliseconds have elapsed since the last time it was invoked.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 600ms)
 * @returns Debounced function with cancel method
 */
export function debounce<T extends DebounceCallback>(
  callback: T,
  delay: number = 600
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedFn = function (this: any, ...args: Parameters<T>) {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
      timeoutId = null;
    }, delay);
  } as T & { cancel: () => void };

  // Allow manual cancellation
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}

/**
 * Debounce utility specifically for cart quantity updates
 * Tracks per-product debounce timers independently
 */
export class CartDebouncer {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private readonly delay: number;

  constructor(delay: number = 600) {
    this.delay = delay;
  }

  /**
   * Debounce a quantity update for a specific product
   * @param productId - Product identifier
   * @param callback - Function to call after debounce delay
   */
  debounce(productId: string, callback: () => void | Promise<void>): void {
    // Clear existing timer for this product
    const existingTimer = this.timers.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(productId);
    }, this.delay);

    this.timers.set(productId, timer);
  }

  /**
   * Cancel pending debounce for a specific product
   */
  cancel(productId: string): void {
    const timer = this.timers.get(productId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(productId);
    }
  }

  /**
   * Cancel all pending debounces
   */
  cancelAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  /**
   * Check if there's a pending debounce for a product
   */
  isPending(productId: string): boolean {
    return this.timers.has(productId);
  }
}
