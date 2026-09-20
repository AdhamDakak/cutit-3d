import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useTranslation } from 'react-i18next'

type OtpStepProps = {
  /** Dial code + number, only used for the "code sent to" line. */
  countryCode: string
  phone: string
  /** Fires once, automatically, the moment all 6 digits are filled — and again on the button. */
  onComplete: (code: string) => void
  isPending?: boolean
  title?: string
}

export function OtpStep({ countryCode, phone, onComplete, isPending, title }: OtpStepProps) {
  const { t } = useTranslation()
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const refs = useRef<Array<TextInput | null>>([])
  const autoSubmittedRef = useRef(false)

  const code = digits.join('')

  useEffect(() => {
    if (code.length === 6 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true
      onComplete(code)
    }
  }, [code, onComplete])

  const updateDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
      setDigits((prev) => {
        const next = [...prev]
        next[index - 1] = ''
        return next
      })
    }
  }

  return (
    <View>
      <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">{title ?? t('auth.verifyTitle')}</Text>
      <Text className="mt-3 text-sm text-stone-500 dark:text-zinc-400">{t('auth.codeSentTo', { code: countryCode, phone })}</Text>
      {/* Digit boxes are entered left-to-right regardless of locale. */}
      <View className="mt-8 flex-row justify-between gap-2" style={{ direction: 'ltr' }}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              refs.current[index] = el
            }}
            value={digit}
            onChangeText={(text) => updateDigit(index, text)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            style={{ textAlign: 'center' }}
            className="h-14 w-12 rounded-xl border border-stone-200 bg-white text-lg font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        ))}
      </View>
      <Text className="mt-3 text-center text-xs text-stone-500 dark:text-zinc-400">{t('auth.resendCode')}</Text>
      <Pressable
        onPress={() => onComplete(code)}
        disabled={digits.some((d) => !d) || isPending}
        className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40"
      >
        <Text className="text-sm font-semibold text-white">{t('auth.verifyContinue')}</Text>
      </Pressable>
    </View>
  )
}
