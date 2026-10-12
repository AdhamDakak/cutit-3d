/**
 * Avatar initials: first letter of the first and last words, uppercased, at most 2 characters — "Amira Nabil" → "AN",
 * "Mostafa" → "M". Works for Arabic names too ("أمينة نبيل" → "أن"; uppercasing is a no-op there). Array.from keeps
 * a letter outside the BMP (e.g. some emoji-like characters) from being split in half. Returns '' for an empty name.
 */
export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = Array.from(words[0])[0] ?? ''
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : ''
  return (first + last).toUpperCase()
}
