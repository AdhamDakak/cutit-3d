import { getCurrentUser, listFavorites, subscribeFavorites, toggleFavorite } from '@/lib/api'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

/** Mirrors the old `favoriteVenueIds: Set<string>` shape from app-state so call sites barely change. */
export function useFavorites() {
  const { data, isLoading, error, refetch } = useAsync(
    async () => {
      const user = await getCurrentUser()
      return listFavorites(user.id)
    },
    [],
    subscribeFavorites,
  )

  const venueIds = new Set(data?.map((favorite) => favorite.venueId))
  return { data: venueIds, isLoading, error, refetch }
}

export function useToggleFavorite() {
  return useMutation(async (venueId: string) => {
    const user = await getCurrentUser()
    return toggleFavorite(user.id, venueId)
  })
}
