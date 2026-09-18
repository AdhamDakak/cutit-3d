import { getVenue, listVenues, type VenueFilters } from '@/lib/api'
import { useAsync } from './useAsync'

export function useVenues(filters?: VenueFilters) {
  return useAsync(() => listVenues(filters), [filters?.gender, filters?.category])
}

export function useVenue(id: string | undefined) {
  return useAsync(() => (id ? getVenue(id) : Promise.resolve(undefined)), [id])
}
