import { Pressable, Text, View } from 'react-native'
import { useColorScheme } from 'nativewind'
import { useRouter } from 'expo-router'
import { Bell, ChevronRight, MapPin, Menu, Moon, Sun } from 'lucide-react-native'

import { Logo } from '@/components/logo'
import { useAppState } from '@/lib/app-state'
import { useThemeColors } from '@/lib/theme'

export function AppHeader() {
  const { colorScheme, toggleColorScheme } = useColorScheme()
  const { isSignedIn, signIn, signOut } = useAppState()
  const colors = useThemeColors()
  const router = useRouter()
  const isDark = colorScheme === 'dark'

  return (
    <View className="border-b border-stone-200/70 bg-[#f7f5f1]/95 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/95">
      <View className="flex-row items-center justify-between">
        <Logo />
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={toggleColorScheme}
            accessibilityLabel="Toggle dark mode"
            className="size-9 items-center justify-center rounded-full active:opacity-80 dark:bg-zinc-800"
          >
            {isDark ? <Sun size={16} color="#facc15" /> : <Moon size={16} color={colors.muted} />}
          </Pressable>
          <Pressable accessibilityLabel="Notifications" className="size-9 items-center justify-center rounded-full active:opacity-80">
            <Bell size={16} color={colors.muted} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/menu')}
            accessibilityLabel="Open menu"
            className="size-9 items-center justify-center rounded-full active:opacity-80"
          >
            <Menu size={16} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">Discover in</Text>
          <Pressable className="mt-1 flex-row items-center gap-1.5">
            <MapPin size={14} color={colors.foreground} />
            <Text className="text-sm font-semibold text-stone-900 dark:text-white">Cairo, Egypt</Text>
            <ChevronRight size={14} color={colors.muted} />
          </Pressable>
        </View>
        <Pressable
          onPress={() => (isSignedIn ? signOut() : signIn())}
          accessibilityLabel="Toggle signed in recommendation profile"
          className="size-10 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
        >
          <Text className="text-sm font-semibold text-stone-900 dark:text-white">{isSignedIn ? 'AN' : 'G'}</Text>
        </Pressable>
      </View>
    </View>
  )
}
