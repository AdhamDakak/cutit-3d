import { Redirect } from 'expo-router'

import { useAppState } from '@/lib/app-state'

export default function Index() {
  const { hasOnboarded } = useAppState()
  return <Redirect href={hasOnboarded ? '/(tabs)' : '/onboarding'} />
}
