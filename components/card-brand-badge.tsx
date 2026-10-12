import { Text, View } from 'react-native'

import type { SavedCard } from '@/lib/data'

const BRANDS: Record<SavedCard['brand'], { label: string; className: string }> = {
  visa: { label: 'VISA', className: 'bg-blue-700' },
  mastercard: { label: 'MC', className: 'bg-orange-500' },
  meeza: { label: 'MEEZA', className: 'bg-emerald-700' },
}

/** Small brand chip standing in for card-network logos (brand names are always Latin, like the wordmark). */
export function CardBrandBadge({ brand }: { brand: SavedCard['brand'] }) {
  const { label, className } = BRANDS[brand]
  return (
    <View className={`h-8 w-12 items-center justify-center rounded-md ${className}`}>
      <Text className="text-[10px] font-bold text-white">{label}</Text>
    </View>
  )
}

export function cardBrandName(brand: SavedCard['brand']) {
  return brand === 'visa' ? 'Visa' : brand === 'mastercard' ? 'Mastercard' : 'Meeza'
}

/** "Visa •••• 4242" — the only card detail the app ever has. Kept LTR by callers. */
export function maskedCard(card: Pick<SavedCard, 'brand' | 'last4'>) {
  return `${cardBrandName(card.brand)} •••• ${card.last4}`
}
