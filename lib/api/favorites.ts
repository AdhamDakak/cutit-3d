import { favorites as seedFavorites, type Favorite } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'

const STORAGE_KEY = '@cutit/favorites'

let store: Favorite[] = [...seedFavorites]

const ready: Promise<void> = hydrate(STORAGE_KEY, () => seedFavorites).then((loaded) => {
  store = loaded
})

function setStore(next: Favorite[]) {
  store = next
  persist(STORAGE_KEY, store)
}

const bus = createInvalidationBus()
export const subscribeFavorites = bus.subscribe

export async function listFavorites(userId: string): Promise<Favorite[]> {
  await ready
  await delay()
  return store.filter((favorite) => favorite.userId === userId)
}

export async function toggleFavorite(userId: string, venueId: string): Promise<void> {
  await ready
  await delay()
  const existing = store.find((favorite) => favorite.userId === userId && favorite.venueId === venueId)
  setStore(
    existing
      ? store.filter((favorite) => favorite.id !== existing.id)
      : [...store, { id: `fav-${Date.now()}`, userId, venueId, createdAt: new Date().toISOString() }],
  )
  bus.invalidate()
}
