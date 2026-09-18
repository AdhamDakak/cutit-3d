import { getStylist, getStylistReviews, getStylistServices, listStylists, type ListStylistsParams } from '@/lib/api'
import { useAsync } from './useAsync'

export function useStylists(params: ListStylistsParams) {
  return useAsync(() => listStylists(params), [params.type, params.gender])
}

export function useStylist(id: string | undefined) {
  return useAsync(() => (id ? getStylist(id) : Promise.resolve(undefined)), [id])
}

export function useStylistServices(stylistId: string | undefined) {
  return useAsync(() => (stylistId ? getStylistServices(stylistId) : Promise.resolve([])), [stylistId])
}

export function useStylistReviews(stylistId: string | undefined) {
  return useAsync(() => (stylistId ? getStylistReviews(stylistId) : Promise.resolve([])), [stylistId])
}
