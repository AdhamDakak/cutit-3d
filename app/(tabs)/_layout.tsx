import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Clock3, Compass, Home, Scissors, UserRound } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

export default function TabsLayout() {
  const { t } = useTranslation()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#60a5fa' : '#1c1917',
        tabBarInactiveTintColor: isDark ? '#71717a' : '#a8a29e',
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(24,24,27,0.95)' : 'rgba(255,255,255,0.95)',
          borderTopColor: isDark ? '#27272a' : '#e7e5e4',
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 20} /> }} />
      <Tabs.Screen name="explore" options={{ title: t('tabs.explore'), tabBarIcon: ({ color, size }) => <Compass color={color} size={size ?? 20} /> }} />
      <Tabs.Screen name="cutit-go" options={{ title: t('tabs.cutitGo'), tabBarIcon: ({ color, size }) => <Scissors color={color} size={size ?? 20} /> }} />
      <Tabs.Screen name="bookings" options={{ title: t('tabs.bookings'), tabBarIcon: ({ color, size }) => <Clock3 color={color} size={size ?? 20} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: ({ color, size }) => <UserRound color={color} size={size ?? 20} /> }} />
    </Tabs>
  )
}
