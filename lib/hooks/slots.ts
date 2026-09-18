import { listSlots, type ListSlotsParams } from '@/lib/api'
import { useAsync } from './useAsync'

/** Pass `null` while the params aren't ready yet (e.g. no service selected) to skip fetching. */
export function useSlots(params: ListSlotsParams | null) {
  return useAsync(() => (params ? listSlots(params) : Promise.resolve([])), [
    params?.venueId,
    params?.staffId,
    params?.serviceId,
    params?.stylistId,
    // Date objects are commonly recreated per render — key on the day, not the reference.
    params?.date?.toDateString(),
    params?.durationMinutes,
    params?.excludeBookingId,
  ])
}
