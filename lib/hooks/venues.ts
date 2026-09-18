import { getVenue, getVenueReviews, getVenueServices, getVenueStaff, listVenues, type VenueFilters } from '@/lib/api'
import { useAsync } from './useAsync'

export function useVenues(filters?: VenueFilters) {
  return useAsync(() => listVenues(filters), [filters?.gender, filters?.category])
}

export function useVenue(id: string | undefined) {
  return useAsync(() => (id ? getVenue(id) : Promise.resolve(undefined)), [id])
}

export function useVenueStaff(venueId: string | undefined) {
  return useAsync(() => (venueId ? getVenueStaff(venueId) : Promise.resolve([])), [venueId])
}

export function useVenueServices(venueId: string | undefined) {
  return useAsync(() => (venueId ? getVenueServices(venueId) : Promise.resolve([])), [venueId])
}

export function useVenueReviews(venueId: string | undefined) {
  return useAsync(() => (venueId ? getVenueReviews(venueId) : Promise.resolve([])), [venueId])
}
