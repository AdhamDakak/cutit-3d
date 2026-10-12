import i18n from '@/lib/i18n'

// Arabic is a joined script: any letter-spacing tears its connected letters apart, so tracking-* classes are dropped
// while Arabic is active. Keyed on the language, not I18nManager.isRTL, which only flips after forceRTL's restart.
export const tracking = (cls: string) => (i18n.language === 'ar' ? '' : cls)

// Pins text to the layout's start edge regardless of the text's own script. RN (iOS, Android, and web) swaps
// textAlign left<->right under RTL layout, so 'left' already means "start" — a language-keyed 'right' would land on the end edge.
export const startAlign = { textAlign: 'left' } as const
