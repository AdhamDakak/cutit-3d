import { createReview, listMyReviews, listStylistReviews, listVenueReviews, subscribeReviews, type CreateReviewInput } from '@/lib/api'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

export function useVenueReviews(venueId: string | undefined) {
  return useAsync(() => (venueId ? listVenueReviews(venueId) : Promise.resolve([])), [venueId], subscribeReviews)
}

export function useStylistReviews(stylistId: string | undefined) {
  return useAsync(() => (stylistId ? listStylistReviews(stylistId) : Promise.resolve([])), [stylistId], subscribeReviews)
}

/** Bookings the current user has already reviewed — lets a booking card hide "Leave a Review" once one exists. */
export function useReviewedBookingIds() {
  const { data, isLoading, error, refetch } = useAsync(() => listMyReviews(), [], subscribeReviews)
  const bookingIds = new Set(data?.map((review) => review.bookingId))
  return { data: bookingIds, isLoading, error, refetch }
}

export function useCreateReview() {
  return useMutation((input: CreateReviewInput) => createReview(input))
}
