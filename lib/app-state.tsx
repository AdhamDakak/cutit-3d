import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert, I18nManager } from 'react-native'
import * as Updates from 'expo-updates'
import { colorScheme } from 'nativewind'

import { syncBookingReminders } from '@/lib/api'
import type { Gender } from '@/lib/data'
import i18n, { type AppLanguage } from '@/lib/i18n'
import { setReminderPreference } from '@/lib/notifications'
import { getItem, setItem } from '@/lib/storage'

const LANGUAGE_STORAGE_KEY = 'cutit.language'
const THEME_STORAGE_KEY = '@cutit/theme'
const REMINDERS_STORAGE_KEY = '@cutit/reminders-enabled'
const ONBOARDED_STORAGE_KEY = '@cutit/onboarded'
// MOCK session: a bare "signed in" flag. The real session will be a Supabase session token kept in
// expo-secure-store (not plain storage) once the backend lands — replace this key, signIn and signOut then.
const SIGNED_IN_STORAGE_KEY = '@cutit/signed-in'
const GUEST_GENDER_STORAGE_KEY = '@cutit/guest-gender'

export type Theme = 'light' | 'dark'

export type { Gender } from '@/lib/data'

// Session/UI-only state lives here. Everything that used to be mock "data"
// — bookings, addresses, favorites, and their mutations — now lives behind
// lib/api + lib/hooks instead, so it can be swapped for a real backend
// without touching this provider.
type AppState = {
  hasOnboarded: boolean
  completeOnboarding: () => void
  isSignedIn: boolean
  signIn: () => void
  signOut: () => void
  /**
   * The content gender while signed out (Home's guest toggle). Signed in, content follows the profile's gender
   * instead — read either through useContentGender() (lib/hooks), never this directly.
   */
  guestGender: Gender
  setGuestGender: (value: Gender) => void
  language: AppLanguage
  setLanguage: (value: AppLanguage) => Promise<void>
  theme: Theme
  toggleTheme: () => void
  remindersEnabled: boolean
  toggleReminders: () => void
  /** True once every persisted value above (onboarding, session, language, theme, reminders) has been read and applied at startup. */
  isHydrated: boolean
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [guestGender, setGuestGenderState] = useState<Gender>('female')
  const [language, setLanguageState] = useState<AppLanguage>(i18n.language as AppLanguage)
  const [theme, setThemeState] = useState<Theme>(colorScheme.get() ?? 'light')
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [storedLanguage, storedTheme, storedReminders, storedOnboarded, storedSignedIn, storedGuestGender] = await Promise.all([
        getItem(LANGUAGE_STORAGE_KEY),
        getItem(THEME_STORAGE_KEY),
        getItem(REMINDERS_STORAGE_KEY),
        getItem(ONBOARDED_STORAGE_KEY),
        getItem(SIGNED_IN_STORAGE_KEY),
        getItem(GUEST_GENDER_STORAGE_KEY),
      ])
      if (!cancelled) {
        setHasOnboarded(storedOnboarded === 'true')
        setIsSignedIn(storedSignedIn === 'true')
        if (storedGuestGender === 'male' || storedGuestGender === 'female') setGuestGenderState(storedGuestGender)
      }
      if (!cancelled && (storedLanguage === 'en' || storedLanguage === 'ar')) {
        await i18n.changeLanguage(storedLanguage)
        setLanguageState(storedLanguage)
        // Re-assert the persisted direction. If a prior session already
        // applied this via forceRTL + restart, I18nManager.isRTL already
        // reflects it natively and this is a no-op; if not, it ensures the
        // native flag is set for the *next* restart.
        const shouldBeRTL = storedLanguage === 'ar'
        I18nManager.allowRTL(shouldBeRTL)
        I18nManager.forceRTL(shouldBeRTL)
      }
      if (!cancelled && (storedTheme === 'light' || storedTheme === 'dark')) {
        colorScheme.set(storedTheme)
        setThemeState(storedTheme)
      }
      if (!cancelled && storedReminders === 'false') {
        setReminderPreference(false)
        setRemindersEnabled(false)
      }
      if (!cancelled) setIsHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setLanguage = async (next: AppLanguage) => {
    await i18n.changeLanguage(next)
    setLanguageState(next)
    setItem(LANGUAGE_STORAGE_KEY, next)

    // I18nManager.forceRTL only takes effect after the native root view is
    // recreated (a full app reload), not on the currently mounted tree —
    // this is a React Native limitation, not a bug in this wiring.
    const shouldBeRTL = next === 'ar'
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL)
      I18nManager.forceRTL(shouldBeRTL)
      try {
        await Updates.reloadAsync()
      } catch {
        Alert.alert(
          'Restart required',
          'Please close and reopen Cutit to apply the new layout direction.',
        )
      }
    }
  }

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    colorScheme.set(next)
    setThemeState(next)
    setItem(THEME_STORAGE_KEY, next)
  }

  const toggleReminders = () => {
    const next = !remindersEnabled
    setRemindersEnabled(next)
    setReminderPreference(next)
    setItem(REMINDERS_STORAGE_KEY, String(next))
    // Off cancels every scheduled reminder; back on restores them for upcoming bookings.
    syncBookingReminders().catch(() => {})
  }

  const value = useMemo<AppState>(
    () => ({
      hasOnboarded,
      completeOnboarding: () => {
        setHasOnboarded(true)
        setItem(ONBOARDED_STORAGE_KEY, 'true')
      },
      isSignedIn,
      signIn: () => {
        setIsSignedIn(true)
        setItem(SIGNED_IN_STORAGE_KEY, 'true')
      },
      // Clears only the session. Onboarding stays done, and bookings/favorites/etc. stay put — they belong to the
      // device until a backend scopes them to an account.
      signOut: () => {
        setIsSignedIn(false)
        setItem(SIGNED_IN_STORAGE_KEY, 'false')
      },
      guestGender,
      setGuestGender: (value: Gender) => {
        setGuestGenderState(value)
        setItem(GUEST_GENDER_STORAGE_KEY, value)
      },
      language,
      setLanguage,
      theme,
      toggleTheme,
      remindersEnabled,
      toggleReminders,
      isHydrated,
    }),
    [hasOnboarded, isSignedIn, guestGender, language, theme, remindersEnabled, isHydrated],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
