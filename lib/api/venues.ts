import {
  getVenueReviews as findVenueReviews,
  getVenueServices as findVenueServices,
  getVenueStaff as findVenueStaff,
  getVenueStartingPrice as findVenueStartingPrice,
  isVenueOpenNow as checkVenueOpenNow,
  venues,
  type Review,
  type Service,
  type Staff,
  type Venue,
  type VenueCategory,
  type VenueGender,
} from '@/lib/data'
import { delay } from './_internal/delay'

/**
 * Fixed mock location in New Cairo (same coordinates as currentUser's seed
 * "Home" address) — stands in for a real GPS fix until expo-location lands.
 */
const MOCK_USER_LOCATION = { latitude: 30.03, longitude: 31.49 }

function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const R = 6371
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export type VenueFilters = {
  /** Matches against name + servicesOffered, case-insensitive. */
  query?: string
  /** A venue whose own gender is 'Unisex' always matches, regardless of this filter. */
  gender?: VenueGender | null
  categories?: VenueCategory[]
  /** Cheapest service (getVenueStartingPrice) must be ≤ this. */
  priceMax?: number
  minRating?: number
  location?: { latitude: number; longitude: number }
  maxDistanceKm?: number
  openNow?: boolean
  /** Day-pill selection — accepted and passed through, but has no filtering effect yet (mock). */
  day?: string
}

export async function listVenues(filters?: VenueFilters): Promise<Venue[]> {
  await delay()
  return venues.filter((venue) => {
    if (filters?.gender && venue.gender !== filters.gender && venue.gender !== 'Unisex') return false
    if (filters?.categories?.length && !filters.categories.includes(venue.category)) return false
    if (filters?.query?.trim()) {
      const haystack = `${venue.name} ${venue.servicesOffered.join(' ')}`.toLowerCase()
      if (!haystack.includes(filters.query.trim().toLowerCase())) return false
    }
    if (filters?.priceMax != null && findVenueStartingPrice(venue.id) > filters.priceMax) return false
    if (filters?.minRating != null && venue.rating < filters.minRating) return false
    if (filters?.openNow && !checkVenueOpenNow(venue.openingHours)) return false
    if (filters?.maxDistanceKm != null) {
      const origin = filters.location ?? MOCK_USER_LOCATION
      if (haversineKm(origin, venue) > filters.maxDistanceKm) return false
    }
    // filters?.day: intentionally not applied — see the type's doc comment.
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
