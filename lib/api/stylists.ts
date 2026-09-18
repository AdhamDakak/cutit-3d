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
  type: StylistServiceType
  gender?: 'male' | 'female'
}

export async function listStylists(params: ListStylistsParams): Promise<Stylist[]> {
  await delay()
  const byType = getStylistsByType(params.type)
  if (!params.gender) return byType
  return byType.filter((stylist) => stylist.servesGender.includes(params.gender as 'male' | 'female'))
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
