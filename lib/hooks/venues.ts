import { getVenue } from '@/lib/api'
import { useAsync } from './useAsync'

export function useVenue(id: string | undefined) {
  return useAsync(() => (id ? getVenue(id) : Promise.resolve(undefined)), [id])
}
