import { useCallback, useState } from 'react'

export type MutationState<TArgs extends unknown[], TResult> = {
  mutate: (...args: TArgs) => Promise<TResult>
  isPending: boolean
  error: Error | null
}

/**
 * Minimal stand-in for a query library's useMutation — same
 * { mutate, isPending, error } shape. Rethrows after recording the error so
 * a caller can still `try { await mutate(...) } catch {}` for one-off
 * handling (e.g. an Alert) while `error` stays around for UI that just
 * wants to render an inline message.
 */
export function useMutation<TArgs extends unknown[], TResult>(mutationFn: (...args: TArgs) => Promise<TResult>): MutationState<TArgs, TResult> {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (...args: TArgs) => {
      setIsPending(true)
      setError(null)
      try {
        return await mutationFn(...args)
      } catch (err) {
        const normalized = err instanceof Error ? err : new Error(String(err))
        setError(normalized)
        throw normalized
      } finally {
        setIsPending(false)
      }
    },
    [mutationFn],
  )

  return { mutate, isPending, error }
}
