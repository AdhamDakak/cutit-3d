import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert, I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Updates from 'expo-updates'

import { bookings as seedBookings, currentUser, favorites, type Address, type Booking } from '@/lib/data'
import i18n, { type AppLanguage } from '@/lib/i18n'

const LANGUAGE_STORAGE_KEY = 'cutit.language'

/**
 * MOCK ONLY. Stands in for the venue/stylist actually confirming a pending
 * booking (a real backend would flip this via a staff dashboard or webhook,
 * not a client-side timer). Delete this whole function — and its call
 * sites in addBooking/rescheduleBooking below — once that exists.
 */
const MOCK_AUTO_CONFIRM_DELAY_MS = 5000

export type Gender = 'For Her' | 'For Him'

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
  /** True once the persisted language has been read and applied at startup. */
  isHydrated: boolean
  favoriteVenueIds: Set<string>
  isFavorite: (venueId: string) => boolean
  toggleFavorite: (venueId: string) => void
  /** In-memory only — resets on reload, same as everything else here except language. */
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  cancelBooking: (id: string) => void
  rescheduleBooking: (id: string, startTime: string, endTime: string) => void
  addresses: Address[]
  addAddress: (address: Omit<Address, 'id'>) => Address
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [activeGender, setActiveGender] = useState<Gender>('For Her')
  const [language, setLanguageState] = useState<AppLanguage>(i18n.language as AppLanguage)
  const [isHydrated, setIsHydrated] = useState(false)
  const [favoriteVenueIds, setFavoriteVenueIds] = useState<Set<string>>(
    () => new Set(favorites.filter((favorite) => favorite.userId === currentUser.id).map((favorite) => favorite.venueId)),
  )
  const [bookings, setBookings] = useState<Booking[]>(seedBookings)
  const [addresses, setAddresses] = useState<Address[]>(currentUser.addresses)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (!cancelled && (stored === 'en' || stored === 'ar')) {
        await i18n.changeLanguage(stored)
        setLanguageState(stored)
        // Re-assert the persisted direction. If a prior session already
        // applied this via forceRTL + restart, I18nManager.isRTL already
        // reflects it natively and this is a no-op; if not, it ensures the
        // native flag is set for the *next* restart.
        const shouldBeRTL = stored === 'ar'
        I18nManager.allowRTL(shouldBeRTL)
        I18nManager.forceRTL(shouldBeRTL)
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

  const toggleFavorite = (venueId: string) => {
    setFavoriteVenueIds((prev) => {
      const next = new Set(prev)
      if (next.has(venueId)) next.delete(venueId)
      else next.add(venueId)
      return next
    })
  }

  // MOCK ONLY — see MOCK_AUTO_CONFIRM_DELAY_MS above.
  const scheduleMockAutoConfirm = (bookingId: string) => {
    setTimeout(() => {
      setBookings((prev) => prev.map((item) => (item.id === bookingId && item.status === 'pending' ? { ...item, status: 'confirmed' } : item)))
    }, MOCK_AUTO_CONFIRM_DELAY_MS)
  }

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking])
    if (booking.status === 'pending') scheduleMockAutoConfirm(booking.id)
  }

  const cancelBooking = (id: string) => {
    setBookings((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)))
  }

  const rescheduleBooking = (id: string, startTime: string, endTime: string) => {
    setBookings((prev) => prev.map((item) => (item.id === id ? { ...item, startTime, endTime, status: 'pending' } : item)))
    scheduleMockAutoConfirm(id)
  }

  const addAddress = (address: Omit<Address, 'id'>): Address => {
    const newAddress: Address = { ...address, id: `addr-${Date.now()}` }
    setAddresses((prev) => [...prev, newAddress])
    return newAddress
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
      isHydrated,
      favoriteVenueIds,
      isFavorite: (venueId: string) => favoriteVenueIds.has(venueId),
      toggleFavorite,
      bookings,
      addBooking,
      cancelBooking,
      rescheduleBooking,
      addresses,
      addAddress,
    }),
    [hasOnboarded, isSignedIn, activeGender, language, isHydrated, favoriteVenueIds, bookings, addresses],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
