import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert, I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Updates from 'expo-updates'
import { colorScheme } from 'nativewind'

import i18n, { type AppLanguage } from '@/lib/i18n'

const LANGUAGE_STORAGE_KEY = 'cutit.language'
const THEME_STORAGE_KEY = '@cutit/theme'

export type Theme = 'light' | 'dark'

export type Gender = 'For Her' | 'For Him'

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
  activeGender: Gender
  setActiveGender: (value: Gender) => void
  language: AppLanguage
  setLanguage: (value: AppLanguage) => Promise<void>
  theme: Theme
  toggleTheme: () => void
  /** True once the persisted language and theme have been read and applied at startup. */
  isHydrated: boolean
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [activeGender, setActiveGender] = useState<Gender>('For Her')
  const [language, setLanguageState] = useState<AppLanguage>(i18n.language as AppLanguage)
  const [theme, setThemeState] = useState<Theme>(colorScheme.get() ?? 'light')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [storedLanguage, storedTheme] = await Promise.all([
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
        AsyncStorage.getItem(THEME_STORAGE_KEY),
      ])
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
      if (!cancelled) setIsHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setLanguage = async (next: AppLanguage) => {
    await i18n.changeLanguage(next)
    setLanguageState(next)
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next)

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
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {})
  }

  const value = useMemo<AppState>(
    () => ({
      hasOnboarded,
      completeOnboarding: () => setHasOnboarded(true),
      isSignedIn,
      signIn: () => setIsSignedIn(true),
      signOut: () => {
        setIsSignedIn(false)
        setHasOnboarded(false)
      },
      activeGender,
      setActiveGender,
      language,
      setLanguage,
      theme,
      toggleTheme,
      isHydrated,
    }),
    [hasOnboarded, isSignedIn, activeGender, language, theme, isHydrated],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
