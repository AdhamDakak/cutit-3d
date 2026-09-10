import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Gender = 'For Her' | 'For Him'

type AppState = {
  hasOnboarded: boolean
  completeOnboarding: () => void
  isSignedIn: boolean
  signIn: () => void
  signOut: () => void
  activeGender: Gender
  setActiveGender: (value: Gender) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [activeGender, setActiveGender] = useState<Gender>('For Her')

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
    }),
    [hasOnboarded, isSignedIn, activeGender],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
