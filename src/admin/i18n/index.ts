/**
 * Admin translations of the draft order pages, in the Medusa admin plugin
 * format: the dashboard deep-merges these resources over its own. The
 * plugin's strings live under `draftOrdersPlugin.*`, so they can't replace
 * the dashboard's keys or another plugin's. `npm run check:i18n` fails when
 * ptBR lacks a key that en has.
 */
import en from "./json/en.json"
import ptBR from "./json/ptBR.json"

export default {
  en: {
    translation: en,
  },
  ptBR: {
    translation: ptBR,
  },
}
