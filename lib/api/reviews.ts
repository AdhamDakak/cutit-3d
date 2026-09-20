import { reviews as seedReviews, type Review } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { getCurrentUser } from './user'

let store: Review[] = [...seedReviews]

const bus = createInvalidationBus()
export const subscribeReviews = bus.subscribe

export async function listVenueReviews(venueId: string): Promise<Review[]> {
  await delay()
  return store.filter((review) => review.venueId === venueId)
}

export async function listStylistReviews(stylistId: string): Promise<Review[]> {
  await delay()
  return store.filter((review) => review.stylistId === stylistId)
}

export async function listMyReviews(): Promise<Review[]> {
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
  store = [...store, review]
  bus.invalidate()
  return review
}
