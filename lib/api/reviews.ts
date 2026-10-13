import { reviews as seedReviews, type Review } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'
import { getCurrentUser } from './user'

const STORAGE_KEY = '@cutit/reviews'

let store: Review[] = [...seedReviews]

// Same hydration gate as bookings.ts: every exported function awaits this before touching `store`.
const ready: Promise<void> = hydrate(STORAGE_KEY, () => seedReviews).then((loaded) => {
  store = loaded
})

function setStore(next: Review[]) {
  store = next
  persist(STORAGE_KEY, store)
}

const bus = createInvalidationBus()
export const subscribeReviews = bus.subscribe

export async function listVenueReviews(venueId: string): Promise<Review[]> {
  await ready
  await delay()
  return store.filter((review) => review.venueId === venueId)
}

export async function listStylistReviews(stylistId: string): Promise<Review[]> {
  await ready
  await delay()
  return store.filter((review) => review.stylistId === stylistId)
}

export async function listMyReviews(): Promise<Review[]> {
  await ready
  await delay()
  const user = await getCurrentUser()
  return store.filter((review) => review.userId === user.id)
}

export type CreateReviewInput = {
  bookingId: string
  venueId?: string | null
  stylistId?: string
  rating: number
  text?: string
  /**
   * Local file URIs straight from the picker, stored as-is. A real backend
   * uploads these to Storage first and stores the resulting public URLs
   * on `photoUrls` instead.
   */
  photoUris?: string[]
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  await ready
  await delay()
  if (store.some((review) => review.bookingId === input.bookingId)) {
    throw new Error('A review already exists for this booking')
  }
  const user = await getCurrentUser()
  const review: Review = {
    id: `rv-${Date.now()}`,
    bookingId: input.bookingId,
    venueId: input.venueId ?? null,
    stylistId: input.stylistId,
    userId: user.id,
    rating: input.rating,
    text: input.text?.trim() || null,
    photoUrls: input.photoUris ?? [],
    authorName: user.fullName,
    createdAt: new Date().toISOString(),
  }
  setStore([...store, review])
  bus.invalidate()
  return review
}

/** Internal — part of deleteAccount (lib/api/user.ts). Only the user's own reviews; other customers' reviews stay. */
export async function deleteReviewsForUser(userId: string): Promise<void> {
  await ready
  setStore(store.filter((review) => review.userId !== userId))
  bus.invalidate()
}
