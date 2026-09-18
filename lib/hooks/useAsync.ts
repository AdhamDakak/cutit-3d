import { useCallback, useEffect, useRef, useState } from 'react'

export type AsyncState<T> = {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Minimal stand-in for a query library's useQuery — same
 * { data, isLoading, error, refetch } shape, no cross-component caching.
 * The intent is that swapping this for a real useQuery later only touches
 * this file, not any call site: every lib/hooks/* read hook is written
 * against this signature.
 *
 * `subscribe` is optional — pass a lib/api subscribeX function so a
 * mutation elsewhere (create/cancel/reschedule/toggle) triggers a refetch
 * here, standing in for query-library cache invalidation.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[], subscribe?: (listener: () => void) => () => void): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
    // deps is caller-supplied on purpose, mirroring useQuery's queryKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => run(), [run])

  useEffect(() => {
    if (!subscribe) return
    return subscribe(run)
  }, [subscribe, run])

  return { data, isLoading, error, refetch: run }
}
