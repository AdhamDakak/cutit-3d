import { useState } from 'react'
import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import { UserRound } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { Gender } from '@/lib/app-state'
import { staff, venues } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

const GENDER_OPTIONS: Gender[] = ['For Her', 'For Him']

/**
 * Toggle between "For Her"/"For Him" and a filtered stylist list below it.
 *
 * There's no dedicated "mobile provider" dataset yet for at-home/events
 * bookings, so this reuses the existing venue-scoped `staff` table,
 * filtered to venues matching the selected gender — a placeholder until
 * a real mobile-provider entity exists (see APP_CONTEXT.md §9.3.1).
 */
export function GenderStylistPicker({ onSelectStylist }: { onSelectStylist: (staffId: string, gender: Gender) => void }) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const [genderFilter, setGenderFilter] = useState<Gender>('For Her')

  const genderKey = genderFilter === 'For Her' ? 'Women' : 'Men'
  const relevantVenueIds = new Set(venues.filter((venue) => venue.gender === genderKey || venue.gender === 'Unisex').map((venue) => venue.id))
  const venueById = new Map(venues.map((venue) => [venue.id, venue]))
  const stylists = staff.filter((member) => relevantVenueIds.has(member.venueId) && member.name !== 'Any Stylist')

  return (
    <View className="gap-5">
      <View className="flex-row rounded-xl bg-stone-200/70 p-1 dark:bg-zinc-800">
        {GENDER_OPTIONS.map((option) => (
          <Pressable
            key={option}
            onPress={() => setGenderFilter(option)}
            className={`flex-1 items-center rounded-lg py-2.5 ${genderFilter === option ? 'bg-white dark:bg-zinc-900' : ''}`}
          >
            <Text
              className={`text-sm font-medium ${genderFilter === option ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-zinc-400'}`}
            >
              {t(`gender.${option}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-3">
        {stylists.length === 0 ? (
          <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('cutitGo.noStylists')}</Text>
        ) : (
          stylists.map((member) => {
            const venue = venueById.get(member.venueId)
            return (
              <Pressable
                key={member.id}
                onPress={() => onSelectStylist(member.id, genderFilter)}
                className="flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 active:opacity-90 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {member.photoUrl ? (
                  <Image source={{ uri: member.photoUrl }} className="size-12 rounded-full" />
                ) : (
                  <View className="size-12 items-center justify-center rounded-full bg-stone-200 dark:bg-zinc-700">
                    <UserRound size={20} color={colors.mutedStrong} />
                  </View>
                )}
                <View className="min-w-0 flex-1">
                  <Text className="font-medium text-stone-900 dark:text-white">{member.name}</Text>
                  <Text className="text-xs text-stone-500 dark:text-zinc-400">
                    {member.role}
                    {venue ? ` · ${venue.name}` : ''}
                  </Text>
                </View>
              </Pressable>
            )
          })
        )}
      </View>
    </View>
  )
}
