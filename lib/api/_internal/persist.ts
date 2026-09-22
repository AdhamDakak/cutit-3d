import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Reads a persisted JSON value for `key`, falling back to `seed()` on a
 * first-ever launch (nothing stored yet) or a corrupt/failed read. Every
 * lib/api/* store awaits this once at module load before any exported
 * function touches its in-memory copy — the data-layer equivalent of
 * app-state.tsx's `isHydrated` gate: these are plain modules, not
 * components, so there's no hook to hang a boolean flag off of, but every
 * consumer already reads through a lib/hooks/* useAsync hook, whose
 * `isLoading` naturally stays true until this resolves — so there's still
 * no flash of seed data before the persisted value loads.
 */
export async function hydrate<T>(key: string, seed: () => T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw != null ? (JSON.parse(raw) as T) : seed()
  } catch {
    return seed()
  }
}

/**
 * Fire-and-forget mirror of an in-memory store to AsyncStorage after a
 * mutation. Never awaited by callers — a write failure here shouldn't block
 * or surface as a mutation error, only the in-memory store is the source of
 * truth for the running session.
 */
export function persist<T>(key: string, value: T): void {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {})
}
