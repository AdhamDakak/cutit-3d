import type { SupportCategory, SupportTicket } from '@/lib/data'
import { delay } from './_internal/delay'
import { hydrate, persist } from './_internal/persist'
import { addNotification } from './notifications'
import { getCurrentUser } from './user'

// MOCK support desk: tickets are only stored on the device. A real backend (or a helpdesk like Intercom/Zendesk)
// receives these and owns the numbering.

const STORAGE_KEY = '@cutit/support-tickets'
const FIRST_TICKET_NUMBER = 1042

let store: SupportTicket[] = []

const ready: Promise<void> = hydrate<SupportTicket[]>(STORAGE_KEY, () => []).then((loaded) => {
  store = loaded
})

function setStore(next: SupportTicket[]) {
  store = next
  persist(STORAGE_KEY, store)
}

export type CreateSupportTicketInput = {
  bookingId?: string | null
  category: SupportCategory
  description: string
  photoUris?: string[]
}

export const MIN_TICKET_DESCRIPTION = 10

export async function createSupportTicket(input: CreateSupportTicketInput): Promise<SupportTicket> {
  await ready
  await delay()
  const description = input.description.trim()
  if (description.length < MIN_TICKET_DESCRIPTION) throw new Error('Description is too short')
  const user = await getCurrentUser()
  const ticket: SupportTicket = {
    id: `tk-${Date.now()}`,
    number: `CT-${FIRST_TICKET_NUMBER + store.length}`,
    userId: user.id,
    bookingId: input.bookingId ?? null,
    category: input.category,
    description,
    photoUrls: input.photoUris ?? [],
    status: 'open',
    createdAt: new Date().toISOString(),
  }
  setStore([...store, ticket])
  addNotification({ type: 'ticket_created', ticketId: ticket.id, bookingId: ticket.bookingId ?? undefined, params: { ticket: ticket.number } }).catch(() => {})
  return ticket
}

/** For reopening a ticket's confirmation (the inbox's ticket_created item links here). */
export async function getSupportTicket(id: string): Promise<SupportTicket | undefined> {
  await ready
  await delay()
  return store.find((ticket) => ticket.id === id)
}

/** Internal — part of deleteAccount (lib/api/user.ts). */
export async function deleteTicketsForUser(userId: string): Promise<void> {
  await ready
  setStore(store.filter((ticket) => ticket.userId !== userId))
}
