import { Modal, Pressable, Text, View } from 'react-native'
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { CreditCard, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useSheetDismissGesture } from '@/components/useSheetDismissGesture'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

/**
 * What "Add card" opens instead of a card form. There is deliberately no card-number entry anywhere in the app: real
 * cards will be added through Paymob's hosted card form/tokenization once online payments launch (see lib/data.ts).
 */
export function AddCardInfoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const { panGesture, animatedStyle } = useSheetDismissGesture(visible, onClose)

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end bg-black/40 p-4">
          <Animated.View style={animatedStyle}>
            <View className="w-full rounded-2xl bg-white p-5 dark:bg-zinc-900">
              <GestureDetector gesture={panGesture}>
                <View className="flex-row items-center justify-between">
                  <View className="size-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                    <CreditCard size={18} color={colors.accent} />
                  </View>
                  <Pressable accessibilityLabel={t('common.close')} onPress={onClose} hitSlop={8}>
                    <X size={18} color={colors.muted} />
                  </Pressable>
                </View>
              </GestureDetector>
              <Text style={startAlign} className="mt-4 font-serif text-xl font-semibold text-stone-900 dark:text-white">
                {t('payments.addCardTitle')}
              </Text>
              <Text style={startAlign} className="mt-2 text-sm leading-6 text-stone-500 dark:text-zinc-400">
                {t('payments.addCardBody')}
              </Text>
              <Pressable onPress={onClose} className="mt-5 items-center rounded-xl bg-stone-900 py-3 dark:bg-blue-600">
                <Text className="text-sm font-semibold text-white">{t('common.ok')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
