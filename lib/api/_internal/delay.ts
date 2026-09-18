/**
 * Fake network latency so mock-backed screens exercise real loading states
 * instead of resolving synchronously. Delete once these functions make
 * actual HTTP calls (which will have their own, real latency).
 */
export function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
