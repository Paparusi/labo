import vi from '@/../public/locales/vi.json'
import en from '@/../public/locales/en.json'

export type Locale = 'vi' | 'en'

const messages: Record<Locale, Record<string, unknown>> = { vi, en }

let currentLocale: Locale = 'vi'

export function setLocale(locale: Locale) {
  currentLocale = locale
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale)
  }
}

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('locale') as Locale) || 'vi'
  }
  return currentLocale
}

export function t(path: string, params?: Record<string, string | number>): string {
  const locale = getLocale()
  const keys = path.split('.')
  let value: unknown = messages[locale]

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[key]
    } else {
      return path
    }
  }

  if (typeof value !== 'string') return path

  if (params) {
    return Object.entries(params).reduce(
      (str, [key, val]) => str.replace(`{${key}}`, String(val)),
      value
    )
  }

  return value
}
