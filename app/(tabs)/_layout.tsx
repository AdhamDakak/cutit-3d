import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Clock3, Compass, Home, UserRound } from 'lucide-react-native'

export default function TabsLayout() {
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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 20} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Compass color={color} size={size ?? 20} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ color, size }) => <Clock3 color={color} size={size ?? 20} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size ?? 20} /> }} />
    </Tabs>
  )
}
