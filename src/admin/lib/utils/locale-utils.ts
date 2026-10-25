import type { Locale } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"

/**
 * The dashboard's language codes ("en", "ptBR", "enGB") as BCP 47 tags
 * ("en", "pt-BR", "en-GB"), which `Intl` expects.
 */
export function toLocaleTag(language?: string) {
  if (!language) {
    return "en"
  }

  return language.replace(/^([a-z]{2,3})([A-Z]{2})$/, "$1-$2")
}

const DATE_LOCALES: Record<string, Locale> = {
  ptBR,
}

/** The date-fns locale for an admin language. English for languages without one. */
export function getDateLocale(language?: string): Locale {
  return (language && DATE_LOCALES[language]) || enUS
}

/**
 * The plural form ("one" or "other") of `count` in an admin language.
 *
 * i18next can't pluralize for the dashboard's "ptBR" code: it isn't a valid
 * BCP 47 tag, so `Intl.PluralRules` throws, i18next skips the `_one`/`_other`
 * suffixes and `t()` falls back to English. The plugin passes this form as the
 * i18next context instead, which resolves the same `_one`/`_other` keys.
 */
export function getPluralForm(language: string | undefined, count: number) {
  try {
    const form = new Intl.PluralRules(toLocaleTag(language)).select(count)

    return form === "one" ? "one" : "other"
  } catch {
    return count === 1 ? "one" : "other"
  }
}
