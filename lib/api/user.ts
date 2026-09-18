import { currentUser, type Address, type User } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'

// There's only ever one mock user in this app, so every hook here can call
// this instead of taking a userId param — the seam is still real (a
// multi-user backend just fills in a different id per session).
let addressStore: Address[] = [...currentUser.addresses]

const bus = createInvalidationBus()
export const subscribeAddresses = bus.subscribe

export async function getCurrentUser(): Promise<User> {
  await delay()
  return currentUser
}

export async function listAddresses(): Promise<Address[]> {
  await delay()
  return addressStore
}

export async function addAddress(input: Omit<Address, 'id'>): Promise<Address> {
  await delay()
  const newAddress: Address = { ...input, id: `addr-${Date.now()}` }
  addressStore = [...addressStore, newAddress]
  bus.invalidate()
  return newAddress
}
