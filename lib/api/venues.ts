import {
  getVenueServices as findVenueServices,
  getVenueStaff as findVenueStaff,
  getVenueStartingPrice as findVenueStartingPrice,
  isVenueOpenNow as checkVenueOpenNow,
  services,
  venues,
  type Gender,
  type Service,
  type Staff,
  type Stylist,
  type Venue,
  type VenueCategory,
} from '@/lib/data'
import { delay } from './_internal/delay'

/**
 * Fixed mock location in New Cairo (same coordinates as currentUser's seed
 * "Home" address) — the distance-filter origin when the caller has no real
 * position (location permission denied or not yet granted).
 */
const MOCK_USER_LOCATION = { latitude: 30.03, longitude: 31.49 }

export type MapBounds = { north: number; south: number; east: number; west: number }

// --- Content gender -------------------------------------------------------------
// One vocabulary everywhere — 'male' | 'female' on User.gender, Venue.gender, Stylist.serves and Staff.serves, no
// unisex — so "does this serve the viewer" is a straight equality check, done only here. Screens read the viewer's
// gender via useContentGender() and pass it in; none of them compares genders themselves.

export function venueServesGender(venue: Pick<Venue, 'gender'>, gender: Gender): boolean {
  return venue.gender === gender
}

/**
 * Every professional — a Cutit Go stylist or a venue's staff member — serves exactly one gender, and all of their
 * services are for it. This is the one check for "can this person serve this viewer", used by stylist lists, venue
 * staff pickers and "Any stylist" availability.
 */
export function professionalServesGender(professional: Pick<Stylist | Staff, 'serves'>, gender: Gender): boolean {
  return professional.serves === gender
}

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
  /** Only venues serving this gender — the content gender by default (Home), or Explore's Men / Women chip. */
  gender?: Gender
  categories?: VenueCategory[]
  /** Cheapest service (getVenueStartingPrice) must be ≤ this. */
  priceMax?: number
  minRating?: number
  /** The user's real position. When set, results are also sorted nearest-first. */
  location?: { latitude: number; longitude: number }
  maxDistanceKm?: number
  /** Only venues inside this map rectangle ("Search this area"). */
  bounds?: MapBounds
  openNow?: boolean
  /** Day-pill selection — accepted and passed through, but has no filtering effect yet (mock). */
  day?: string
}

export async function listVenues(filters?: VenueFilters): Promise<Venue[]> {
  await delay()
  const bounds = filters?.bounds
  const matches = venues.filter((venue) => {
    if (bounds && (venue.latitude > bounds.north || venue.latitude < bounds.south || venue.longitude > bounds.east || venue.longitude < bounds.west)) {
      return false
    }
    if (filters?.gender && !venueServesGender(venue, filters.gender)) return false
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
  const origin = filters?.location
  return origin ? matches.sort((a, b) => haversineKm(origin, a) - haversineKm(origin, b)) : matches
}

export async function getVenue(id: string): Promise<Venue | undefined> {
  await delay()
  return venues.find((venue) => venue.id === id)
}

/** With `gender`, only the staff who serve it (professionalServesGender) — the venue's stylist picker. */
export async function getVenueStaff(venueId: string, gender?: Gender): Promise<Staff[]> {
  await delay()
  const members = findVenueStaff(venueId)
  return gender ? members.filter((member) => professionalServesGender(member, gender)) : members
}

export async function getVenueServices(venueId: string): Promise<Service[]> {
  await delay()
  return findVenueServices(venueId)
}

// Both are pure, synchronous derivations over data already in memory (a
// price formatted from the services table, an open/closed flag from a
// venue's own opening hours) — re-exported rather than wrapped in delay()
// so call sites can keep using them inline during render, same as before.
export { getVenueStartingPrice, isVenueOpenNow } from '@/lib/data'

// Display order for Home's service chips; anything not listed sorts after these, alphabetically.
const SERVICE_CATEGORY_ORDER = ['Hair', 'Beard', 'Styling', 'Color', 'Nails', 'Facial', 'Makeup', 'Bridal', 'Combo']

export type ServiceCategoryOption = { category: string; venueIds: string[] }

/**
 * The service categories offered by the given venues, each with the venues that offer it — Home's chips. Derived
 * from what those venues actually sell, so every chip has at least one venue behind it.
 */
export async function listVenueServiceCategories(venueIds: string[]): Promise<ServiceCategoryOption[]> {
  await delay()
  const wanted = new Set(venueIds)
  const byCategory = new Map<string, Set<string>>()
  for (const service of services) {
    if (!service.venueId || !wanted.has(service.venueId)) continue
    if (!byCategory.has(service.category)) byCategory.set(service.category, new Set())
    byCategory.get(service.category)!.add(service.venueId)
  }
  const rank = (category: string) => {
    const index = SERVICE_CATEGORY_ORDER.indexOf(category)
    return index === -1 ? SERVICE_CATEGORY_ORDER.length : index
  }
  return [...byCategory.entries()]
    .map(([category, ids]) => ({ category, venueIds: [...ids] }))
    .sort((a, b) => rank(a.category) - rank(b.category) || a.category.localeCompare(b.category))
}
