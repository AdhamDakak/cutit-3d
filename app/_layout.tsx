import '../global.css'
import '@/lib/i18n'
import '@/lib/nativewind-interop'

import { Fraunces_600SemiBold, useFonts } from '@expo-google-fonts/fraunces'
import { Inter_400Regular } from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

import { AppStateProvider, useAppState } from '@/lib/app-state'

SplashScreen.preventAutoHideAsync()

/**
 * Renders nothing — just watches both readiness signals (fonts + the
 * persisted-language hydration read in AppStateProvider) and hides the
 * native splash once both are ready. Kept as a sibling of <Stack> rather
 * than gating the tree's mount on either signal, since deferring <Stack>'s
 * mount races index.tsx's <Redirect> against React Navigation's own mount
 * handshake (the exact bug fixed earlier when the fonts gate was removed).
 */
function SplashGate({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isHydrated } = useAppState()

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isHydrated])

  return null
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Inter_400Regular,
  })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <SplashGate fontsLoaded={fontsLoaded} />
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="venue/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="chat-support" options={{ presentation: 'modal' }} />
            <Stack.Screen name="help" options={{ presentation: 'modal' }} />
            <Stack.Screen name="menu" options={{ presentation: 'modal' }} />
            <Stack.Screen name="favorites" options={{ presentation: 'modal' }} />
            <Stack.Screen name="booking-flow" />
            <Stack.Screen name="stylist/[id]" />
            <Stack.Screen name="reschedule" />
            {/* go-booking is a nested <Stack> (see its own _layout.tsx) — the
                whole 4-step flow opens as one modal, steps push inside it. */}
            <Stack.Screen name="go-booking" options={{ presentation: 'modal' }} />
            {/* Terminal screen after a booking — swipe-to-dismiss and Android
                back are both disabled (see its own BackHandler) so the user
                can only leave via its own "View in Bookings"/"Done" buttons. */}
            <Stack.Screen
              name="booking-confirmation"
              options={{ presentation: 'modal', gestureEnabled: false, headerShown: false }}
            />
          </Stack>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
