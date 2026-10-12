import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MMKV } from 'react-native-mmkv'

/**
 * The app's key-value store: MMKV (synchronous, native) in dev/production builds. Expo Go doesn't ship MMKV's native
 * module — its Nitro layer throws at import time — so it's required lazily, and on failure everything falls back to
 * AsyncStorage, the store this replaced. Reads stay async either way so callers never need to know which is live.
 */
let mmkv: MMKV | null = null
try {
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv')
  mmkv = createMMKV({ id: 'cutit' })
} catch {
  mmkv = null
}

const MIGRATED_FLAG = '@cutit/migrated-from-async-storage'
// Only Cutit's own keys move over — on web AsyncStorage and MMKV share localStorage, so AsyncStorage.getAllKeys()
// also lists MMKV's own (prefixed) entries.
const isAppKey = (key: string) => key.startsWith('@cutit/') || key.startsWith('cutit.')

/**
 * One-time move of everything written by the AsyncStorage era into MMKV, then deletes the AsyncStorage copies.
 * Never overwrites a key MMKV already holds, and only flags itself done once the copy succeeded, so a failed run is
 * retried on the next launch.
 */
async function migrateFromAsyncStorage(store: MMKV) {
  if (store.getBoolean(MIGRATED_FLAG)) return
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter(isAppKey)
    const entries = await AsyncStorage.multiGet(keys)
    for (const [key, value] of entries) {
      if (value != null && !store.contains(key)) store.set(key, value)
    }
    store.set(MIGRATED_FLAG, true)
    await AsyncStorage.multiRemove(keys)
  } catch {}
}

const ready: Promise<void> = mmkv ? migrateFromAsyncStorage(mmkv) : Promise.resolve()

export async function getItem(key: string): Promise<string | null> {
  await ready
  if (mmkv) return mmkv.getString(key) ?? null
  return AsyncStorage.getItem(key)
}

/** Fire-and-forget write: synchronous on MMKV, swallowed on the AsyncStorage fallback. */
export function setItem(key: string, value: string): void {
  if (mmkv) {
    mmkv.set(key, value)
    return
  }
  AsyncStorage.setItem(key, value).catch(() => {})
}
