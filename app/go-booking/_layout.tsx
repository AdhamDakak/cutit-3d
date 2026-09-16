import { createContext, useContext, useState, type ReactNode } from 'react'
import { Stack } from 'expo-router'

type GoBookingDraft = {
  selectedServiceIds: Set<string>
  toggleService: (id: string) => void
  addressId: string | null
  setAddressId: (id: string) => void
  eventDate: string
  setEventDate: (date: string) => void
  eventNotes: string
  setEventNotes: (notes: string) => void
  selectedDate: Date | null
  setSelectedDate: (date: Date) => void
  selectedTime: string | null
  setSelectedTime: (time: string | null) => void
}

const GoBookingDraftContext = createContext<GoBookingDraft | null>(null)

/**
 * Scoped to this one nested stack only — resets when the flow is left,
 * never touches lib/app-state.tsx. stylistId/type are deliberately NOT
 * here; they're carried as route params and read via
 * useLocalSearchParams() in each step instead, per the flow design.
 */
export function useGoBookingDraft() {
  const ctx = useContext(GoBookingDraftContext)
  if (!ctx) throw new Error('useGoBookingDraft must be used within the go-booking flow')
  return ctx
}

function GoBookingDraftProvider({ children }: { children: ReactNode }) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set())
  const [addressId, setAddressId] = useState<string | null>(null)
  const [eventDate, setEventDate] = useState('')
  const [eventNotes, setEventNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const value: GoBookingDraft = {
    selectedServiceIds,
    toggleService,
    addressId,
    setAddressId,
    eventDate,
    setEventDate,
    eventNotes,
    setEventNotes,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
  }

  return <GoBookingDraftContext.Provider value={value}>{children}</GoBookingDraftContext.Provider>
}

export default function GoBookingLayout() {
  return (
    <GoBookingDraftProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="services" />
        <Stack.Screen name="address" />
        <Stack.Screen name="datetime" />
        <Stack.Screen name="review" />
      </Stack>
    </GoBookingDraftProvider>
  )
}
