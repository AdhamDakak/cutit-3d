import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import type { TFunction } from 'i18next'
import { Briefcase, Home, MapPin } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { AddressInput } from '@/lib/api'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

// 'Home' and 'Work' are stored as-is (Address.label's documented values) and translated only for display;
// anything else is the user's own custom label.
const PRESET_LABELS = ['Home', 'Work'] as const
type LabelChoice = (typeof PRESET_LABELS)[number] | 'Other' | null

/** Fallback for a label left blank — what the go-booking form has always saved. */
const DEFAULT_LABEL = 'Address'

export function addressLabelText(label: string, t: TFunction) {
  if (label === 'Home') return t('account.labelHome')
  if (label === 'Work') return t('account.labelWork')
  return label
}

export function addressIcon(label: string) {
  return label === 'Home' ? Home : label === 'Work' ? Briefcase : MapPin
}

const INPUT_CLASS =
  'rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white'
const CENTERED_TEXT = { fontSize: 14, lineHeight: 18 }

function initialChoice(label: string | undefined): LabelChoice {
  if (!label) return null
  return label === 'Home' || label === 'Work' ? label : 'Other'
}

/**
 * Label chips (Home / Work / Other + a custom label), area, and details, with its own Save button. Used inline by the
 * go-booking address step and full-screen by app/account/address-form.tsx. Submits only when area and details are
 * filled; `showErrors` adds an inline message for that case (the go-booking step leaves it off, as it always has).
 */
export function AddressForm({
  initial,
  submitLabel,
  isPending,
  showErrors,
  onSubmit,
}: {
  initial?: AddressInput
  submitLabel: string
  isPending?: boolean
  showErrors?: boolean
  onSubmit: (input: AddressInput) => void | Promise<void>
}) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const [choice, setChoice] = useState<LabelChoice>(initialChoice(initial?.label))
  const [customLabel, setCustomLabel] = useState(initial && initialChoice(initial.label) === 'Other' ? initial.label : '')
  const [area, setArea] = useState(initial?.area ?? '')
  const [details, setDetails] = useState(initial?.details ?? '')
  const [attempted, setAttempted] = useState(false)

  const isValid = !!area.trim() && !!details.trim()

  const submit = () => {
    setAttempted(true)
    if (!isValid || isPending) return
    const label = choice === 'Home' || choice === 'Work' ? choice : customLabel.trim() || DEFAULT_LABEL
    void onSubmit({ ...initial, label, area: area.trim(), details: details.trim() })
  }

  const chips: { value: Exclude<LabelChoice, null>; text: string }[] = [
    { value: 'Home', text: t('account.labelHome') },
    { value: 'Work', text: t('account.labelWork') },
    { value: 'Other', text: t('account.labelOther') },
  ]

  return (
    <View className="gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <View className="flex-row flex-wrap gap-2">
        {chips.map((chip) => {
          const active = choice === chip.value
          return (
            <Pressable
              key={chip.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setChoice(active ? null : chip.value)}
              className={`rounded-full border px-3.5 py-2 ${
                active ? 'border-stone-900 bg-stone-900 dark:border-blue-500 dark:bg-blue-600' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
              }`}
            >
              <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-stone-600 dark:text-zinc-400'}`}>{chip.text}</Text>
            </Pressable>
          )
        })}
      </View>
      {choice === 'Other' ? (
        <TextInput
          value={customLabel}
          onChangeText={setCustomLabel}
          placeholder={t('goBooking.addressLabelPlaceholder')}
          placeholderTextColor={colors.muted}
          textAlignVertical="center"
          style={CENTERED_TEXT}
          className={INPUT_CLASS}
        />
      ) : null}
      <TextInput
        value={area}
        onChangeText={setArea}
        placeholder={t('goBooking.addressAreaPlaceholder')}
        placeholderTextColor={colors.muted}
        textAlignVertical="center"
        style={CENTERED_TEXT}
        className={INPUT_CLASS}
      />
      <TextInput
        value={details}
        onChangeText={setDetails}
        placeholder={t('goBooking.addressDetailsPlaceholder')}
        placeholderTextColor={colors.muted}
        textAlignVertical="center"
        style={CENTERED_TEXT}
        className={INPUT_CLASS}
      />
      {showErrors && attempted && !isValid ? (
        <Text style={startAlign} className="text-xs text-red-500">
          {t('account.addressRequired')}
        </Text>
      ) : null}
      <Pressable onPress={submit} disabled={isPending} className="items-center rounded-lg bg-stone-900 py-2.5 disabled:opacity-50 dark:bg-blue-600">
        <Text className="text-sm font-semibold text-white">{isPending ? t('account.saving') : submitLabel}</Text>
      </Pressable>
    </View>
  )
}
