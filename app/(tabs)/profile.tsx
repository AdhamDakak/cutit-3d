import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  Bell,
  Check,
  CreditCard,
  FileText,
  Flag,
  Heart,
  HelpCircle,
  Languages,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Pencil,
  Phone,
  ShieldCheck,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
  MapPin,
} from 'lucide-react-native'

import { useTranslation } from 'react-i18next'

import { addressIcon, addressLabelText } from '@/components/address-form'
import { CheckoutAuthSheet } from '@/components/checkout-auth-sheet'
import { maskedCard } from '@/components/card-brand-badge'
import { SettingRow, ToggleRow } from '@/components/settings-rows'
import { useAppState, type Gender } from '@/lib/app-state'
import { getInitials } from '@/lib/format'
import { useAddresses, useCards, useCurrentUser, useDefaultPaymentMethod, useWallet } from '@/lib/hooks'
import type { AppLanguage } from '@/lib/i18n'
import { startAlign, tracking } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

const LANGUAGE_OPTIONS: { code: AppLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
]

export default function ProfileScreen() {
  const { t } = useTranslation()
  const { isSignedIn, activeGender, setActiveGender, signOut, language, setLanguage, theme, toggleTheme, remindersEnabled, toggleReminders } = useAppState()
  const colors = useThemeColors()
  const router = useRouter()
  const isDark = theme === 'dark'
  const [offers, setOffers] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  // Guests see none of the account data below (until sign-up it's the seeded mock user's). Every value comes from lib/hooks, so edits made on the account/* screens show up here as soon as they save.
  const { data: user } = useCurrentUser()
  const { data: addresses } = useAddresses()
  const { data: wallet } = useWallet()
  const { data: cards } = useCards()
  const { data: paymentMethod } = useDefaultPaymentMethod()
  const defaultCard = cards?.find((card) => card.isDefault)
  const balance = wallet?.balanceEGP ?? user?.walletBalance ?? 0
  const visibleAddresses = (addresses ?? []).slice(0, 2)
  const fullName = user?.fullName ?? ''
  const initials = getInitials(fullName)

  const sectionClass = 'overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
  const labelClass = `mb-2 px-1 text-[11px] font-medium uppercase ${tracking('tracking-[2.5px]')} text-stone-500 dark:text-zinc-400`

  const handleSignOut = () => {
    signOut()
    router.replace('/onboarding')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pb-10 pt-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">{t('profile.title')}</Text>
          {isSignedIn ? (
            <Pressable
              accessibilityLabel={t('profile.editProfile')}
              onPress={() => router.push({ pathname: '/account/edit-field', params: { field: 'name' } })}
              className="size-9 items-center justify-center rounded-full bg-white dark:bg-zinc-800"
            >
              <Pencil size={16} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        {isSignedIn ? (
          <>
            <View className="flex-row items-center gap-4">
              <View accessibilityLabel={`${fullName} initials`} className="size-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60">
                <Text className="text-2xl font-semibold text-blue-700 dark:text-blue-200">{initials}</Text>
              </View>
              <View>
                <Text className="text-lg font-semibold text-stone-900 dark:text-white">{fullName}</Text>
                <View className="mt-1 flex-row items-center gap-1">
                  <Phone size={14} color={colors.muted} />
                  {/* Phone numbers stay LTR in every locale. Read-only on purpose: once real auth exists, changing the
                      number has to go through OTP re-verification of the new one, not a plain edit. */}
                  <Text className="text-sm text-stone-500 dark:text-zinc-400" style={{ writingDirection: 'ltr' }}>
                    {user?.phone ?? ''}
                  </Text>
                  <Check size={14} color="#3b82f6" />
                </View>
                <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{t('profile.memberSince')}</Text>
              </View>
            </View>

            <View className="flex-row divide-x divide-stone-200 rounded-2xl border border-stone-200 bg-white py-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-1 items-center">
                <Text className="text-lg font-semibold text-stone-900 dark:text-white">12</Text>
                <Text className="mt-1 text-[10px] text-stone-500 dark:text-zinc-400">{t('profile.statBookings')}</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-lg font-semibold text-stone-900 dark:text-white">{addresses?.length ?? '–'}</Text>
                <Text className="mt-1 text-[10px] text-stone-500 dark:text-zinc-400">{t('profile.statAddresses')}</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-lg font-semibold text-stone-900 dark:text-white">{balance}</Text>
                <Text className="mt-1 text-[10px] text-stone-500 dark:text-zinc-400">{t('profile.statWallet')}</Text>
              </View>
            </View>

            <View>
              <Text className={labelClass}>{t('profile.personalInformation')}</Text>
              <View className={sectionClass}>
                <SettingRow
                  icon={UserRound}
                  label={t('profile.fullName')}
                  value={fullName}
                  onPress={() => router.push({ pathname: '/account/edit-field', params: { field: 'name' } })}
                />
                <SettingRow
                  icon={Mail}
                  label={t('profile.emailAddress')}
                  value={user?.email || '—'}
                  onPress={() => router.push({ pathname: '/account/edit-field', params: { field: 'email' } })}
                />
                <View className="flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
                  <View className="size-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
                    <UsersRound size={16} color={colors.mutedStrong} />
                  </View>
                  <Text style={startAlign} className="flex-1 text-sm font-medium text-stone-900 dark:text-white">{t('profile.smartRecommendations')}</Text>
                  <View className="flex-row rounded-lg bg-stone-100 p-0.5 dark:bg-zinc-800">
                    {(['For Her', 'For Him'] as Gender[]).map((item) => (
                      <Pressable key={item} onPress={() => setActiveGender(item)} className={`rounded-md px-2 py-1.5 ${activeGender === item ? 'bg-blue-600' : ''}`}>
                        <Text className={`text-[10px] font-semibold ${activeGender === item ? 'text-white' : 'text-stone-500 dark:text-zinc-400'}`}>
                          {t(`gender.${item}`)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View>
              <Text className={labelClass}>{t('profile.savedAddresses')}</Text>
              <View className={sectionClass}>
                {visibleAddresses.map((address) => (
                  <SettingRow
                    key={address.id}
                    icon={addressIcon(address.label)}
                    label={addressLabelText(address.label, t)}
                    value={`${address.area}, ${address.details}`}
                    onPress={() => router.push({ pathname: '/account/address-form', params: { id: address.id } })}
                  />
                ))}
                {(addresses?.length ?? 0) > visibleAddresses.length ? (
                  <SettingRow
                    icon={MapPin}
                    label={t('account.seeAllAddresses', { count: addresses?.length ?? 0 })}
                    onPress={() => router.push('/account/addresses')}
                  />
                ) : null}
                <Pressable onPress={() => router.push('/account/address-form')} className="flex-row items-center gap-2 px-4 py-3">
                  <Plus size={16} color="#2563eb" />
                  <Text className="text-sm font-semibold text-blue-600">{t('profile.addNewAddress')}</Text>
                </Pressable>
              </View>
            </View>

            <View>
              <Text className={labelClass}>{t('profile.paymentWallet')}</Text>
              <View className={sectionClass}>
                <Pressable
                  onPress={() => router.push('/account/wallet')}
                  className="flex-row items-center gap-3 border-b border-stone-100 px-4 py-4 dark:border-zinc-800"
                >
                  <View className="size-9 items-center justify-center rounded-xl bg-blue-600">
                    <WalletCards size={16} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('profile.wallet')}</Text>
                    <Text className="text-xs text-stone-500 dark:text-zinc-400">{t('profile.availableBalance')}</Text>
                  </View>
                  <Text className="text-sm font-bold text-stone-900 dark:text-white">{t('venue.priceEGP', { price: balance })}</Text>
                  <Pressable
                    accessibilityLabel={t('profile.topUpWallet')}
                    onPress={() => router.push('/account/wallet')}
                    className="size-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950"
                  >
                    <Plus size={16} color="#2563eb" />
                  </Pressable>
                </Pressable>
                <SettingRow
                  icon={CreditCard}
                  label={t('profile.savedCards')}
                  value={defaultCard ? maskedCard(defaultCard) : t('payments.none')}
                  onPress={() => router.push('/account/cards')}
                />
                <SettingRow
                  icon={WalletCards}
                  label={t('profile.defaultPayment')}
                  value={paymentMethod ? t(`payments.method.${paymentMethod}`) : ''}
                  onPress={() => router.push('/account/payment-method')}
                />
              </View>
            </View>
          </>
        ) : (
          <View className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <View className="size-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
              <UserRound size={22} color={colors.accent} />
            </View>
            <Text style={startAlign} className="mt-4 font-serif text-xl font-semibold text-stone-900 dark:text-white">
              {t('profile.guestTitle')}
            </Text>
            <Text style={startAlign} className="mt-1 text-sm leading-6 text-stone-500 dark:text-zinc-400">
              {t('profile.guestBody')}
            </Text>
            <Pressable onPress={() => setShowSignup(true)} className="mt-4 items-center rounded-xl bg-blue-600 py-3">
              <Text className="text-sm font-semibold text-white">{t('profile.guestCta')}</Text>
            </Pressable>
          </View>
        )}

        <View>
          <Text className={labelClass}>{t('profile.preferences')}</Text>
          <View className={sectionClass}>
            <ToggleRow icon={isDark ? Moon : Sun} label={t('profile.darkMode')} checked={isDark} onChange={toggleTheme} />
            <View className="min-h-14 flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
              <Languages size={16} color={colors.mutedStrong} />
              <Text style={startAlign} className="flex-1 text-sm font-medium text-stone-900 dark:text-white">{t('profile.language')}</Text>
              <View className="flex-row rounded-lg bg-stone-100 p-0.5 dark:bg-zinc-800">
                {LANGUAGE_OPTIONS.map((item) => (
                  <Pressable
                    key={item.code}
                    onPress={() => setLanguage(item.code)}
                    className={`rounded-md px-2 py-1.5 ${language === item.code ? 'bg-blue-600' : ''}`}
                  >
                    <Text className={`text-[10px] font-semibold ${language === item.code ? 'text-white' : 'text-stone-500 dark:text-zinc-400'}`}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <ToggleRow icon={Bell} label={t('profile.appointmentReminders')} checked={remindersEnabled} onChange={toggleReminders} />
            <ToggleRow icon={Sparkles} label={t('profile.exclusiveOffers')} checked={offers} onChange={() => setOffers(!offers)} />
          </View>
        </View>

        <View>
          <Text className={labelClass}>{t('profile.supportLegal')}</Text>
          <View className={sectionClass}>
            <SettingRow
              icon={MessageCircle}
              label={t('profile.chatSupport')}
              value={t('profile.chatWithTeam')}
              onPress={() => router.push('/chat-support')}
            />
            <SettingRow icon={HelpCircle} label={t('profile.faqs')} onPress={() => router.push('/support/faqs')} />
            <SettingRow icon={Flag} label={t('profile.reportIssue')} onPress={() => router.push('/support/report-issue')} />
            <SettingRow icon={FileText} label={t('profile.termsOfService')} onPress={() => router.push('/legal/terms')} />
            <SettingRow icon={ShieldCheck} label={t('profile.privacyPolicy')} onPress={() => router.push('/legal/privacy')} />
          </View>
        </View>

        {isSignedIn ? (
          <View className="gap-3">
            <Pressable onPress={handleSignOut} className="min-h-12 flex-row items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-zinc-700">
              <LogOut size={16} color={colors.mutedStrong} />
              <Text className="text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('profile.logOut')}</Text>
            </Pressable>
            <Pressable className="flex-row items-center justify-center py-2">
              <Trash2 size={14} color="#ef4444" />
              <Text className="ms-1 text-xs text-red-500">{t('profile.deleteAccount')}</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      <CheckoutAuthSheet mode="signup" visible={showSignup} onClose={() => setShowSignup(false)} onAuthenticated={() => setShowSignup(false)} />
    </SafeAreaView>
  )
}
