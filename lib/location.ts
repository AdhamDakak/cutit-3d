import { useEffect, useSyncExternalStore } from 'react'
import * as Location from 'expo-location'

export type LatLng = { latitude: number; longitude: number }

// One device position shared by every screen for the session — device state, not backend data, so it lives here
// rather than behind lib/api.
let coords: LatLng | null = null
let prompted = false
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function resolvePosition(prompt: boolean) {
  try {
    const permission = prompt ? await Location.requestForegroundPermissionsAsync() : await Location.getForegroundPermissionsAsync()
    if (!permission.granted) return
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }))
    coords = { latitude: position.coords.latitude, longitude: position.coords.longitude }
    listeners.forEach((listener) => listener())
  } catch {
    // Location services off or the lookup failed: callers fall back exactly as if permission were denied.
  }
}

/**
 * The user's position, or null if unknown/denied. `prompt: true` asks for foreground permission (once per session);
 * `prompt: false` only reads a permission the user already granted, so it never shows a dialog.
 */
export function useUserLocation({ prompt }: { prompt: boolean }): LatLng | null {
  const value = useSyncExternalStore(subscribe, () => coords, () => null)
  useEffect(() => {
    if (coords) return
    if (prompt) {
      if (prompted) return
      prompted = true
    }
    void resolvePosition(prompt)
  }, [prompt])
  return value
}
