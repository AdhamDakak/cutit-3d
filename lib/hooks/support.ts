import { createSupportTicket, getSupportTicket, type CreateSupportTicketInput } from '@/lib/api'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

export function useCreateSupportTicket() {
  return useMutation((input: CreateSupportTicketInput) => createSupportTicket(input))
}

export function useSupportTicket(id: string | undefined) {
  return useAsync(() => (id ? getSupportTicket(id) : Promise.resolve(undefined)), [id])
}
