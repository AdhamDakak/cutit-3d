import { generateStylistTimeSlots, generateTimeSlots, type StylistTimeSlot, type TimeSlot } from '@/lib/data'
import { delay } from './_internal/delay'
import { getBookingsSnapshot } from './bookings'

export type ListSlotsParams = {
  venueId?: string
  staffId?: string
  /** Required alongside venueId+staffId — generateTimeSlots validates the service exists. */
  serviceId?: string
  stylistId?: string
  date: Date
  durationMinutes?: number
  /** Reschedule flow: exclude the booking being moved from its own conflict check. */
  excludeBookingId?: string
}

/**
 * This is the seam: today it derives availability on the client from the
 * mock schedule + booking list; a real backend would compute this
 * server-side (and this function's body becomes an HTTP call) without any
 * caller needing to change.
 */
export async function listSlots(params: ListSlotsParams): Promise<(TimeSlot | StylistTimeSlot)[]> {
  await delay()

  if (params.stylistId) {
    const snapshot = await getBookingsSnapshot()
    const bookingsList = params.excludeBookingId ? snapshot.filter((booking) => booking.id !== params.excludeBookingId) : snapshot
    return generateStylistTimeSlots({
      stylistId: params.stylistId,
      durationMinutes: params.durationMinutes ?? 30,
      date: params.date,
      bookingsList,
    })
  }

  // Salon slots still check only the static seed bookings, not the live
  // store — generateTimeSlots has no bookingsList override (unlike its
  // stylist counterpart above). Pre-existing simplification, carried over
  // rather than fixed: this refactor relocates data access, it doesn't
  // change behavior.
  if (params.venueId && params.staffId && params.serviceId) {
    return generateTimeSlots({
      venueId: params.venueId,
      staffId: params.staffId,
      serviceId: params.serviceId,
      date: params.date,
      durationMinutes: params.durationMinutes,
    })
  }

  return []
}
