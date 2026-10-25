import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Heading } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { KeyboundForm } from "../../../../components/common/keybound-form"
import { RouteDrawer } from "../../../../components/modals"
import { useZodErrorMap } from "../../../../hooks/common/use-zod-error-map"

const CustomItems = () => {
  const { t } = useTranslation()

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("draftOrdersPlugin.customItems.title")}</Heading>
        </RouteDrawer.Title>
      </RouteDrawer.Header>
      <CustomItemsForm />
    </RouteDrawer>
  )
}

const CustomItemsForm = () => {
  const { t } = useTranslation()
  const zodErrorMap = useZodErrorMap()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema, { error: zodErrorMap }),
  })

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm className="flex flex-1 flex-col">
        <RouteDrawer.Body></RouteDrawer.Body>
        <RouteDrawer.Footer>
          <div className="flex justify-end gap-2">
            <RouteDrawer.Close asChild>
              <Button size="small" variant="secondary">
                {t("draftOrdersPlugin.general.cancel")}
              </Button>
            </RouteDrawer.Close>
            <Button size="small" type="submit">
              {t("draftOrdersPlugin.general.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}

const schema = z.object({
  email: z.string().email(),
})

export default CustomItems
