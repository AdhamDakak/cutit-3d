import {
  getStylistServices as findStylistServices,
  getStylistsByType,
  stylists,
  type Gender,
  type Service,
  type Stylist,
  type StylistServiceType,
} from '@/lib/data'
import { delay } from './_internal/delay'
import { professionalServesGender } from './venues'

export type ListStylistsParams = {
  /** Omit to browse across both at-home and events-bridal stylists (Explore's Professionals mode). */
  type?: StylistServiceType
  gender?: Gender
  minRating?: number
}

/** With `gender`, only stylists who serve it (professionalServesGender). */
export async function listStylists(params: ListStylistsParams): Promise<Stylist[]> {
  await delay()
  let result = params.type ? getStylistsByType(params.type) : stylists
  const gender = params.gender
  if (gender) result = result.filter((stylist) => professionalServesGender(stylist, gender))
  if (params.minRating != null) result = result.filter((stylist) => stylist.rating >= params.minRating!)
  return result
}

export async function getStylist(id: string): Promise<Stylist | undefined> {
  await delay()
  return stylists.find((stylist) => stylist.id === id)
}

/** All of a stylist's services — they're all for the one gender the stylist serves. */
export async function getStylistServices(stylistId: string): Promise<Service[]> {
  await delay()
  return findStylistServices(stylistId)
}
