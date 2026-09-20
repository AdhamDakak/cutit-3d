import {
  addAddress,
  completeProfile,
  getCurrentUser,
  listAddresses,
  requestOtp,
  subscribeAddresses,
  subscribeUser,
  verifyOtp,
  type CompleteProfileInput,
} from '@/lib/api'
import { useAppState } from '@/lib/app-state'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

export function useCurrentUser() {
  return useAsync(() => getCurrentUser(), [], subscribeUser)
}

export function useAddresses() {
  return useAsync(() => listAddresses(), [], subscribeAddresses)
}

export function useAddAddress() {
  return useMutation(addAddress)
}

export function useRequestOtp() {
  return useMutation((phone: string) => requestOtp(phone))
}

/** A verified code is the moment the session becomes signed-in, so this owns the app-state flip. */
export function useVerifyOtp() {
  const { signIn } = useAppState()
  return useMutation(async (phone: string, code: string) => {
    await verifyOtp(phone, code)
    signIn()
  })
}

export function useCompleteProfile() {
  return useMutation((input: CompleteProfileInput) => completeProfile(input))
}
