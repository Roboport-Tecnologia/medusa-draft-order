import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { z } from "zod"

type Issue = Parameters<z.core.$ZodErrorMap>[0]

/** zod's name for a value's type, as in its messages ("received undefined"). */
function getParsedType(data: unknown) {
  if (typeof data === "number") {
    return Number.isNaN(data) ? "NaN" : "number"
  }

  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return "array"
    }

    if (data === null) {
      return "null"
    }

    if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
      return data.constructor.name
    }
  }

  return typeof data
}

function stringifyPrimitive(value: unknown) {
  if (typeof value === "bigint") {
    return value.toString() + "n"
  }

  if (typeof value === "string") {
    return `"${value}"`
  }

  return `${value}`
}

/**
 * The error map for the forms' zod schemas, passed to `zodResolver` as the
 * parse option `error`. It translates the issues these schemas raise; the
 * English values in `en.json` repeat zod's own English messages. Other issues
 * keep zod's message.
 *
 * Custom issues set `params.i18nKey` instead of a message.
 */
export const useZodErrorMap = () => {
  const { t } = useTranslation()

  return useCallback(
    (issue: Issue): string | undefined => {
      switch (issue.code) {
        case "custom": {
          const key = issue.params?.i18nKey

          return typeof key === "string" ? t(key) : undefined
        }
        case "invalid_type": {
          const missing = issue.input === undefined || issue.input === null

          return t(
            missing
              ? "draftOrdersPlugin.validation.required"
              : "draftOrdersPlugin.validation.invalidType",
            {
              expected: issue.expected,
              received: getParsedType(issue.input),
            }
          )
        }
        case "too_small": {
          if (issue.origin !== "string") {
            return undefined
          }

          const minimum = Number(issue.minimum)
          const comparison = issue.inclusive ? ">=" : ">"
          const count = issue.inclusive ? minimum : minimum + 1

          return t(
            count <= 1
              ? "draftOrdersPlugin.validation.requiredText"
              : "draftOrdersPlugin.validation.tooShort",
            { comparison, minimum: issue.minimum.toString(), length: count }
          )
        }
        case "invalid_format":
          return issue.format === "email"
            ? t("draftOrdersPlugin.validation.invalidEmail")
            : undefined
        case "invalid_value":
          return issue.values.length === 1
            ? t("draftOrdersPlugin.validation.invalidValue", {
                value: stringifyPrimitive(issue.values[0]),
              })
            : t("draftOrdersPlugin.validation.invalidOption", {
                values: issue.values.map(stringifyPrimitive).join("|"),
              })
        case "invalid_union":
          return t("draftOrdersPlugin.validation.invalidInput")
        default:
          return undefined
      }
    },
    [t]
  )
}
