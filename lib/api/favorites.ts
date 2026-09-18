import { favorites as seedFavorites, type Favorite } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'

let store: Favorite[] = [...seedFavorites]

const bus = createInvalidationBus()
export const subscribeFavorites = bus.subscribe

export async function listFavorites(userId: string): Promise<Favorite[]> {
  await delay()
  return store.filter((favorite) => favorite.userId === userId)
}

export async function toggleFavorite(userId: string, venueId: string): Promise<void> {
  await delay()
  const existing = store.find((favorite) => favorite.userId === userId && favorite.venueId === venueId)
  store = existing
    ? store.filter((favorite) => favorite.id !== existing.id)
    : [...store, { id: `fav-${Date.now()}`, userId, venueId, createdAt: new Date().toISOString() }]
  bus.invalidate()
}
