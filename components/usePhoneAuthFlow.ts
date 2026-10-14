import { useState } from 'react'

import { COUNTRY_CODES, type CountryCode } from '@/components/country-code-picker'
import type { Gender } from '@/lib/data'
import { useCompleteProfile, useLogIn, useRequestOtp, useVerifyOtp } from '@/lib/hooks'

export type AuthFlow = 'signup' | 'login'
export type AuthStep = 'phone' | 'otp' | 'profile' | 'not-found' | 'welcome-back'

/**
 * The one phone → OTP flow behind both app/auth.tsx and CheckoutAuthSheet, in two flavours:
 * - login: a registered number logs straight in (no profile step); an unknown one lands on 'not-found', whose
 *   "Create an account" switches to signup and jumps to the profile step — the OTP is already verified, so no resend.
 * - signup: an unknown number goes to the profile step; a registered one is logged in instead of creating a
 *   duplicate, via a 'welcome-back' step whose Continue calls `onAuthenticated`.
 * Either way the session is signed in by useLogIn/useCompleteProfile, never by the OTP alone.
 */
export function usePhoneAuthFlow({ initialFlow, defaultGender, onAuthenticated }: { initialFlow: AuthFlow; defaultGender: Gender; onAuthenticated: () => void }) {
  const [flow, setFlow] = useState<AuthFlow>(initialFlow)
  const [step, setStep] = useState<AuthStep>('phone')
  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState<Gender | null>(defaultGender)
  const [welcomeName, setWelcomeName] = useState('')

  const requestOtp = useRequestOtp()
  const verifyOtp = useVerifyOtp()
  const logIn = useLogIn()
  const completeProfile = useCompleteProfile()
  const error = requestOtp.error || verifyOtp.error || logIn.error || completeProfile.error
  const fullPhone = `${country.code} ${phone}`

  const reset = () => {
    setFlow(initialFlow)
    setStep('phone')
    setPhone('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setGender(defaultGender)
    setWelcomeName('')
  }

  const submitPhone = async () => {
    try {
      await requestOtp.mutate(fullPhone)
      setStep('otp')
    } catch {
      // surfaced via `error`
    }
  }

  const submitOtp = async (code: string) => {
    try {
      const { isNewUser } = await verifyOtp.mutate(fullPhone, code)
      if (isNewUser) {
        setStep(flow === 'login' ? 'not-found' : 'profile')
        return
      }
      const user = await logIn.mutate(fullPhone)
      if (flow === 'signup') {
        setWelcomeName(user.firstName)
        setStep('welcome-back')
      } else {
        onAuthenticated()
      }
    } catch {
      // surfaced via `error`
    }
  }

  const submitProfile = async () => {
    if (!gender) return
    try {
      await completeProfile.mutate({ firstName, lastName, email: email || undefined, gender, phone: fullPhone })
      onAuthenticated()
    } catch {
      // surfaced via `error`
    }
  }

  /** From 'not-found': back to the phone step in the same mode, to try a different number. */
  const startOver = () => {
    setStep('phone')
    setPhone('')
  }

  /** From 'not-found': the number is already verified, so go straight to the profile step. */
  const createInsteadOfLogin = () => {
    setFlow('signup')
    setStep('profile')
  }

  return {
    flow,
    switchFlow: () => setFlow((current) => (current === 'login' ? 'signup' : 'login')),
    step,
    country,
    setCountry,
    phone,
    setPhone,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    gender,
    setGender,
    welcomeName,
    submitPhone,
    submitOtp,
    submitProfile,
    createInsteadOfLogin,
    startOver,
    reset,
    error,
    isRequestingOtp: requestOtp.isPending,
    isVerifying: verifyOtp.isPending || logIn.isPending,
    isCreating: completeProfile.isPending,
  }
}
