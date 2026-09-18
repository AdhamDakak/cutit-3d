type Listener = () => void

/**
 * Tiny pub/sub so a mutation (createBooking, cancelBooking, addAddress...)
 * can tell whichever hooks are watching that resource to refetch — this is
 * exactly what a query library's cache-invalidation would do; swapping in
 * TanStack Query later means deleting this file and every subscribe/invalidate
 * pair built on it, not changing any call site's shape.
 */
export function createInvalidationBus() {
  const listeners = new Set<Listener>()
  return {
    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    invalidate(): void {
      listeners.forEach((listener) => listener())
    },
  }
}
