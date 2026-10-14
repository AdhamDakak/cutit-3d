import type { User } from '@/lib/data'

type Named = Pick<User, 'firstName' | 'lastName'>

/** "Omar Khaled". */
export function getFullName(user: Named): string {
  return [user.firstName, user.lastName].map((part) => part.trim()).filter(Boolean).join(' ')
}

/**
 * "Omar K." — first name + last initial, for anywhere other people can see it (e.g. a review's author), so a full
 * surname isn't shown publicly. Falls back to just the first name.
 */
export function getDisplayName(user: Named): string {
  const first = user.firstName.trim()
  const lastInitial = Array.from(user.lastName.trim())[0]
  return lastInitial ? `${first} ${lastInitial}.` : first
}

/**
 * Avatar initials, at most 2 characters, uppercased (a no-op for Arabic, where "أمينة نبيل" → "أن"). A user uses
 * their first + last name; a plain string (staff, review authors) uses its first and last words — "Amira Nabil" →
 * "AN", "Mostafa" → "M". Array.from keeps a letter outside the BMP from being split in half. '' for an empty name.
 */
export function getInitials(nameOrUser: string | Named): string {
  const first = (word: string) => Array.from(word.trim())[0] ?? ''
  if (typeof nameOrUser !== 'string') return (first(nameOrUser.firstName) + first(nameOrUser.lastName)).toUpperCase()
  const words = nameOrUser.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  return (first(words[0]) + (words.length > 1 ? first(words[words.length - 1]) : '')).toUpperCase()
}
