import { useColorScheme } from 'react-native'

export function useThemeColors() {
  const dark = useColorScheme() === 'dark'
  return {
    dark,
    foreground: dark ? '#ffffff' : '#1c1917',
    muted: dark ? '#a1a1aa' : '#78716c',
    mutedStrong: dark ? '#d4d4d8' : '#57534e',
    border: dark ? '#3f3f46' : '#e7e5e4',
    card: dark ? '#18181b' : '#ffffff',
    accent: dark ? '#60a5fa' : '#2563eb',
    amber: '#fbbf24',
    emerald: '#10b981',
  }
}
