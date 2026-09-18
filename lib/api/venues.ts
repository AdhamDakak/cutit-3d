import type { Gender } from '@/lib/app-state'
import {
  getVenueReviews as findVenueReviews,
  getVenueServices as findVenueServices,
  getVenueStaff as findVenueStaff,
  venues,
  type Review,
  type Service,
  type Staff,
  type Venue,
  type VenueCategory,
} from '@/lib/data'
import { delay } from './_internal/delay'

export type VenueFilters = {
  /** Maps 'For Her'/'For Him' to Venue.gender the same way every screen used to inline this check. */
  gender?: Gender
  category?: VenueCategory
}

export async function listVenues(filters?: VenueFilters): Promise<Venue[]> {
  await delay()
  return venues.filter((venue) => {
    if (filters?.gender) {
      const genderKey = filters.gender === 'For Her' ? 'Women' : 'Men'
      if (venue.gender !== genderKey && venue.gender !== 'Unisex') return false
    }
    if (filters?.category && venue.category !== filters.category) return false
    return true
  })
}

export async function getVenue(id: string): Promise<Venue | undefined> {
  await delay()
  return venues.find((venue) => venue.id === id)
}

export async function getVenueStaff(venueId: string): Promise<Staff[]> {
  await delay()
  return findVenueStaff(venueId)
}

export async function getVenueServices(venueId: string): Promise<Service[]> {
  await delay()
  return findVenueServices(venueId)
}

export async function getVenueReviews(venueId: string): Promise<Review[]> {
  await delay()
  return findVenueReviews(venueId)
}

// Both are pure, synchronous derivations over data already in memory (a
// price formatted from the services table, an open/closed flag from a
// venue's own opening hours) — re-exported rather than wrapped in delay()
// so call sites can keep using them inline during render, same as before.
export { getVenueStartingPrice, isVenueOpenNow } from '@/lib/data'
