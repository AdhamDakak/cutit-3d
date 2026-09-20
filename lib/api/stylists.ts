import {
  getStylistReviews as findStylistReviews,
  getStylistServices as findStylistServices,
  getStylistsByType,
  stylists,
  type Review,
  type Service,
  type Stylist,
  type StylistServiceType,
} from '@/lib/data'
import { delay } from './_internal/delay'

export type ListStylistsParams = {
  /** Omit to browse across both at-home and events-bridal stylists (Explore's Professionals mode). */
  type?: StylistServiceType
  gender?: 'male' | 'female'
  minRating?: number
}

export async function listStylists(params: ListStylistsParams): Promise<Stylist[]> {
  await delay()
  let result = params.type ? getStylistsByType(params.type) : stylists
  if (params.gender) result = result.filter((stylist) => stylist.servesGender.includes(params.gender as 'male' | 'female'))
  if (params.minRating != null) result = result.filter((stylist) => stylist.rating >= params.minRating!)
  return result
}

export async function getStylist(id: string): Promise<Stylist | undefined> {
  await delay()
  return stylists.find((stylist) => stylist.id === id)
}

export async function getStylistServices(stylistId: string): Promise<Service[]> {
  await delay()
  return findStylistServices(stylistId)
}

export async function getStylistReviews(stylistId: string): Promise<Review[]> {
  await delay()
  return findStylistReviews(stylistId)
}
