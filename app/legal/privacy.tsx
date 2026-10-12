import { useTranslation } from 'react-i18next'

import { LegalDocumentScreen } from '@/components/legal-document-screen'

// TODO(legal): placeholder text — needs legal review before launch (see content/legal.ts).
export default function PrivacyScreen() {
  const { t } = useTranslation()
  return <LegalDocumentScreen document="privacy" title={t('profile.privacyPolicy')} />
}
