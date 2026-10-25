import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { getPluralForm } from "../../lib/utils/locale-utils"

export type PluralT = (
  key: string,
  count: number,
  options?: Record<string, unknown>
) => string

/**
 * `t()` for keys with `_one`/`_other` forms. It passes the plural form as the
 * context, so the forms resolve in ptBR too (see `getPluralForm`).
 */
export const usePlural = (): PluralT => {
  const { t, i18n } = useTranslation()
  const language = i18n.language

  return useCallback(
    (key, count, options) =>
      t(key, {
        ...options,
        count,
        context: getPluralForm(language, count),
      }) as string,
    [t, language]
  )
}
