import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { getFullDate, getRelativeDate } from "../../lib/utils/date-utils"
import { getDateLocale } from "../../lib/utils/locale-utils"

/** Date formatting in the admin's language (date-fns' ptBR for ptBR, enUS otherwise). */
export const useDate = () => {
  const { i18n } = useTranslation()
  const locale = getDateLocale(i18n.language)

  const fullDate = useCallback(
    ({ date, includeTime }: { date: string | Date; includeTime?: boolean }) =>
      getFullDate({ date, includeTime, locale }),
    [locale]
  )

  const relativeDate = useCallback(
    (date: string | Date) => getRelativeDate(date, locale),
    [locale]
  )

  return { getFullDate: fullDate, getRelativeDate: relativeDate }
}
