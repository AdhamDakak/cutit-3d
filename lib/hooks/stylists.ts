import { getStylist } from '@/lib/api'
import { useAsync } from './useAsync'

export function useStylist(id: string | undefined) {
  return useAsync(() => (id ? getStylist(id) : Promise.resolve(undefined)), [id])
}
