import { Modal, Pressable, Text, View } from 'react-native'
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { AlertTriangle, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useSheetDismissGesture } from '@/components/useSheetDismissGesture'
import { WalletNotEmptyError } from '@/lib/api'
import { useDeleteAccount, useWallet } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

/**
 * Confirms Delete Account: what's deleted, that it can't be undone, and that upcoming bookings are cancelled. With a
 * wallet balance it also warns that the balance is lost, points to support for a refund, and only deletes via
 * "Delete anyway" (forfeitWalletBalance: true). `onDeleted` runs after the account is gone and the session is signed out.
 */
export function DeleteAccountSheet({ visible, onClose, onDeleted }: { visible: boolean; onClose: () => void; onDeleted: () => void }) {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { data: wallet } = useWallet()
  const { mutate: deleteAccount, isPending, error } = useDeleteAccount()
  const { panGesture, animatedStyle } = useSheetDismissGesture(visible, onClose)

  const balance = wallet?.balanceEGP ?? 0
  const hasBalance = balance > 0

  // Only the "Delete anyway" path passes forfeitWalletBalance; deleteAccount rejects otherwise while a balance remains.
  const confirm = async (forfeitWalletBalance: boolean) => {
    try {
      await deleteAccount({ forfeitWalletBalance })
      onDeleted()
    } catch {
      // surfaced below
    }
  }

  const contactSupport = () => {
    onClose()
    router.push('/chat-support')
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end bg-black/40 p-4">
          <Animated.View style={animatedStyle}>
            <View className="w-full rounded-2xl bg-white p-5 dark:bg-zinc-900">
              <GestureDetector gesture={panGesture}>
                <View className="flex-row items-center justify-between">
                  <View className="size-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                    <AlertTriangle size={18} color="#ef4444" />
                  </View>
                  <Pressable accessibilityLabel={t('common.close')} onPress={onClose} hitSlop={8}>
                    <X size={18} color={colors.muted} />
                  </Pressable>
                </View>
              </GestureDetector>
              <Text style={startAlign} className="mt-4 font-serif text-xl font-semibold text-stone-900 dark:text-white">
                {t('account.deleteTitle')}
              </Text>
              <Text style={startAlign} className="mt-2 text-sm leading-6 text-stone-500 dark:text-zinc-400">
                {t('account.deleteBody')}
              </Text>

              {hasBalance ? (
                <View className="mt-4 gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-950/30">
                  <Text style={startAlign} className="text-sm font-bold leading-5 text-red-700 dark:text-red-300">
                    {t('account.deleteWalletWarning', { amount: balance })}
                  </Text>
                  <Text style={startAlign} className="text-sm text-red-700/90 dark:text-red-300/90">
                    {t('account.deleteWalletHint')}
                  </Text>
                </View>
              ) : null}
              {/* A WalletNotEmptyError here only means the balance changed after the sheet opened; the warning above covers it. */}
              {error && !(error instanceof WalletNotEmptyError) ? <Text className="mt-3 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}

              {hasBalance ? (
                <Pressable onPress={contactSupport} disabled={isPending} className="mt-5 items-center rounded-xl bg-stone-900 py-3 dark:bg-blue-600">
                  <Text className="text-sm font-semibold text-white">{t('account.contactSupport')}</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={isPending || !wallet}
                onPress={() => void confirm(hasBalance)}
                className={`${hasBalance ? 'mt-2' : 'mt-5'} items-center rounded-xl bg-red-600 py-3 disabled:opacity-40`}
              >
                <Text className="text-sm font-semibold text-white">
                  {isPending ? t('account.deleting') : t(hasBalance ? 'account.deleteAnyway' : 'account.deleteButton')}
                </Text>
              </Pressable>
              <Pressable onPress={onClose} disabled={isPending} className="mt-2 items-center rounded-xl py-3">
                <Text className="text-sm font-semibold text-stone-700 dark:text-zinc-200">{t('common.cancel')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
