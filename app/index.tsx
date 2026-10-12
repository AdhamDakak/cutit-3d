import { useEffect } from 'react'
import { Redirect, type Href } from 'expo-router'

import { useAppState } from '@/lib/app-state'
import { clearLaunchReminder, getLaunchReminderPath } from '@/lib/notifications'

export default function Index() {
  const { hasOnboarded, isHydrated } = useAppState()
  // A reminder tap that cold-launched the app decides the first screen here, instead of a later push racing this
  // redirect. Only a returning user can have one (reminders follow a booking, which follows onboarding).
  const launchPath = getLaunchReminderPath()

  useEffect(() => {
    if (isHydrated && launchPath) clearLaunchReminder()
  }, [isHydrated, launchPath])

  // Wait for the persisted onboarding/session flags so a returning user never sees a flash of onboarding (the splash
  // screen stays up until then anyway, see SplashGate).
  if (!isHydrated) return null
  return <Redirect href={(launchPath ?? (hasOnboarded ? '/(tabs)' : '/onboarding')) as Href} />
}
