import { addAddress, listAddresses, subscribeAddresses } from '@/lib/api'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

export function useAddresses() {
  return useAsync(() => listAddresses(), [], subscribeAddresses)
}

export function useAddAddress() {
  return useMutation(addAddress)
}
