import {
  ComponentPropsWithoutRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react"
import { useTranslation } from "react-i18next"

import { TrianglesMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useCountryName } from "../../hooks/common/use-country-name"
import { countries } from "../../lib/data/countries"
import { toLocaleTag } from "../../lib/utils/locale-utils"

export const CountrySelect = forwardRef<
  HTMLSelectElement,
  ComponentPropsWithoutRef<"select"> & {
    placeholder?: string
    value?: string
    defaultValue?: string
  }
>(
  (
    { className, disabled, placeholder, value, defaultValue, ...props },
    ref
  ) => {
    const { t, i18n } = useTranslation()
    const getCountryName = useCountryName()
    const innerRef = useRef<HTMLSelectElement>(null)

    useImperativeHandle(ref, () => innerRef.current as HTMLSelectElement)

    const isPlaceholder = innerRef.current?.value === ""

    // Translated names are sorted in the admin's language; English keeps
    // the order of `countries`.
    const options = useMemo(() => {
      const named = countries.map((country) => ({
        iso_2: country.iso_2,
        name: getCountryName(country.iso_2, country.display_name),
      }))

      if (i18n.language === "en") {
        return named
      }

      const collator = new Intl.Collator(toLocaleTag(i18n.language))

      return named.sort((a, b) => collator.compare(a.name, b.name))
    }, [getCountryName, i18n.language])

    return (
      <div className="relative">
        <TrianglesMini
          className={clx(
            "text-ui-fg-muted transition-fg pointer-events-none absolute right-2 top-1/2 -translate-y-1/2",
            {
              "text-ui-fg-disabled": disabled,
            }
          )}
        />
        <select
          value={value !== undefined ? value.toLowerCase() : undefined}
          defaultValue={defaultValue ? defaultValue.toLowerCase() : undefined}
          disabled={disabled}
          className={clx(
            "bg-ui-bg-field shadow-buttons-neutral transition-fg txt-compact-small flex w-full select-none appearance-none items-center justify-between rounded-md px-2 py-1.5 outline-none",
            "placeholder:text-ui-fg-muted text-ui-fg-base",
            "hover:bg-ui-bg-field-hover",
            "focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active",
            "aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error",
            "invalid::border-ui-border-error invalid:shadow-borders-error",
            "disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled",
            {
              "text-ui-fg-muted": isPlaceholder,
            },
            className
          )}
          {...props}
          ref={innerRef}
        >
          {/* Add an empty option so the first option is preselected */}
          <option value="" disabled className="text-ui-fg-muted">
            {placeholder || t("draftOrdersPlugin.fields.selectCountry")}
          </option>
          {options.map((country) => {
            return (
              <option key={country.iso_2} value={country.iso_2.toLowerCase()}>
                {country.name}
              </option>
            )
          })}
        </select>
      </div>
    )
  }
)
CountrySelect.displayName = "CountrySelect"
