import { dictionaries, type Locale } from "./dictionaries"

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries.en
}
