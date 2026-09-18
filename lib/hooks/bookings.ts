import { cancelBooking, createBooking, getBooking, getCurrentUser, listBookings, rescheduleBooking, subscribeBookings, type CreateBookingInput } from '@/lib/api'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

/** All bookings for the current (only) mock user. */
export function useBookings() {
  return useAsync(
    async () => {
      const user = await getCurrentUser()
      return listBookings(user.id)
    },
    [],
    subscribeBookings,
  )
}

export function useBooking(id: string | undefined) {
  return useAsync(() => (id ? getBooking(id) : Promise.resolve(undefined)), [id], subscribeBookings)
}

export function useCreateBooking() {
  return useMutation((input: CreateBookingInput) => createBooking(input))
}

export function useCancelBooking() {
  return useMutation((id: string) => cancelBooking(id))
}

export function useRescheduleBooking() {
  return useMutation((id: string, startTime: string, endTime: string) => rescheduleBooking(id, startTime, endTime))
}
