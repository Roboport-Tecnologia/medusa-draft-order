import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { toLocaleTag } from "../../lib/utils/locale-utils"

/**
 * Country names in the admin's language. English keeps the names of
 * `lib/data/countries`; other languages get them from `Intl.DisplayNames`.
 */
export const useCountryName = () => {
  const { i18n } = useTranslation()
  const language = i18n.language

  const displayNames = useMemo(() => {
    if (!language || language === "en") {
      return null
    }

    try {
      return new Intl.DisplayNames([toLocaleTag(language)], { type: "region" })
    } catch {
      return null
    }
  }, [language])

  return useCallback(
    (iso2: string, fallback: string) => {
      if (!displayNames) {
        return fallback
      }

      try {
        return displayNames.of(iso2.toUpperCase()) ?? fallback
      } catch {
        return fallback
      }
    },
    [displayNames]
  )
}
