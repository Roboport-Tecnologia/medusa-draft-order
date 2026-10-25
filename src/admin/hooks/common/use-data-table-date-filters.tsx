import { createDataTableFilterHelper } from "@medusajs/ui"
import { subDays, subMonths } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useDate } from "./use-date"

const filterHelper = createDataTableFilterHelper<any>()

const useDateFilterOptions = () => {
  const { t } = useTranslation()
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  return useMemo(() => {
    return [
      {
        label: t("draftOrdersPlugin.dateFilters.today"),
        value: {
          $gte: today.toISOString(),
        },
      },
      {
        label: t("draftOrdersPlugin.dateFilters.last7Days"),
        value: {
          $gte: subDays(today, 7).toISOString(), // 7 days ago
        },
      },
      {
        label: t("draftOrdersPlugin.dateFilters.last30Days"),
        value: {
          $gte: subDays(today, 30).toISOString(), // 30 days ago
        },
      },
      {
        label: t("draftOrdersPlugin.dateFilters.last90Days"),
        value: {
          $gte: subDays(today, 90).toISOString(), // 90 days ago
        },
      },
      {
        label: t("draftOrdersPlugin.dateFilters.last12Months"),
        value: {
          $gte: subMonths(today, 12).toISOString(), // 12 months ago
        },
      },
    ]
  }, [today, t])
}

export const useDataTableDateFilters = (disableRangeOption?: boolean) => {
  const { t } = useTranslation()
  const { getFullDate } = useDate()
  const dateFilterOptions = useDateFilterOptions()

  const rangeOptions = useMemo(() => {
    if (disableRangeOption) {
      return {
        disableRangeOption: true,
      }
    }

    return {
      rangeOptionStartLabel: t("draftOrdersPlugin.dateFilters.starting"),
      rangeOptionEndLabel: t("draftOrdersPlugin.dateFilters.ending"),
      rangeOptionLabel: t("draftOrdersPlugin.dateFilters.custom"),
      options: dateFilterOptions,
    }
  }, [disableRangeOption, dateFilterOptions, t])

  return useMemo(() => {
    return [
      filterHelper.accessor("created_at", {
        type: "date",
        label: t("draftOrdersPlugin.dateFilters.createdAt"),
        format: "date",
        formatDateValue: (date) => getFullDate({ date }),
        options: dateFilterOptions,
        ...rangeOptions,
      }),
      filterHelper.accessor("updated_at", {
        type: "date",
        label: t("draftOrdersPlugin.dateFilters.updatedAt"),
        format: "date",
        formatDateValue: (date) => getFullDate({ date }),
        options: dateFilterOptions,
        ...rangeOptions,
      }),
    ]
  }, [dateFilterOptions, getFullDate, rangeOptions, t])
}
