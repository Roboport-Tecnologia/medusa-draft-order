import type { Locale } from "date-fns"
import { format, formatDistance, sub } from "date-fns"
import { enUS } from "date-fns/locale"

export function getRelativeDate(
  date: string | Date,
  locale: Locale = enUS
): string {
  const now = new Date()

  return formatDistance(sub(new Date(date), { minutes: 0 }), now, {
    addSuffix: true,
    locale,
  })
}

export const getFullDate = ({
  date,
  includeTime = false,
  locale = enUS,
}: {
  date: string | Date
  includeTime?: boolean
  locale?: Locale
}) => {
  const ensuredDate = new Date(date)

  if (isNaN(ensuredDate.getTime())) {
    return ""
  }

  const timeFormat = includeTime ? "p" : ""

  return format(ensuredDate, `PP ${timeFormat}`, {
    locale,
  })
}
