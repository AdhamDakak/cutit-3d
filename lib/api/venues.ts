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
} from '@/lib/data'
import { delay } from './_internal/delay'

export type VenueFilters = {
  /** Maps 'For Her'/'For Him' to Venue.gender the same way every screen used to inline this check. */
  gender?: Gender
}

export async function listVenues(filters?: VenueFilters): Promise<Venue[]> {
  await delay()
  if (!filters?.gender) return venues
  const genderKey = filters.gender === 'For Her' ? 'Women' : 'Men'
  return venues.filter((venue) => venue.gender === genderKey || venue.gender === 'Unisex')
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
