# Decisions

## Why a fork

`@medusajs/draft-order` hardcodes its admin strings in English and ships no translations. medusa-brasil used to translate its pages in the DOM, swapping whole strings from a dictionary with a `MutationObserver`. That missed every string Medusa added or reworded and could translate catalog data that happened to equal a UI string. A fork that sends every string through `t()` fixes it at the source. Upstream would be the better home for the change; until it lands there, the fork keeps the diff to string extraction so rebasing stays cheap.

## Package name and version

- The name stays `@medusajs/draft-order`. `defineConfig` (`@medusajs/utils`) always adds `{ resolve: "@medusajs/draft-order" }` to the plugins, and `@medusajs/medusa` depends on `"@medusajs/draft-order": "2.21.1"`. Under another name, the app would load both the fork and upstream, with two sets of routes for `/draft-orders`.
- Apps install it from GitHub (`#dist`) or yalc and replace the transitive copy with an npm override (`"$@medusajs/draft-order"`). See the README for npm workspaces, where the override needs a root dependency.
- The version is `2.21.1-roboport.1`. npm accepts a prerelease version under an override (tested with tarball, `file:` and workspace installs), and nothing in Medusa reads the plugin's version. Because `2.21.1-roboport.1` doesn't satisfy `@medusajs/medusa`'s `"2.21.1"`, the override is mandatory, and `npm ls` fails when it isn't applied. With the plain upstream version, npm would sometimes dedupe to the fork by luck and sometimes install upstream next to it, and `npm ls` would show two `2.21.1` copies that look the same.

## Build and dependencies

- npm with a lockfile, exact pins, like the other Roboport plugins. Runtime dependencies are pinned to what an app resolves for upstream's ranges today (`@ariakit/react` 0.4.40, `@babel/runtime` 7.29.7, `@uiw/react-json-view` 2.0.0-alpha.43, `date-fns` 3.6.0, `lodash.debounce` 4.0.8, `lodash.isequal` 4.5.0, `match-sorter` 6.3.4; the rest were already exact).
- Peers are pinned the way the other plugins pin them; they stay optional (`peerDependenciesMeta`) as upstream has them, so npm doesn't install them into the app. `react-i18next` 13.5.0 is a peer too: the bundle imports it and must get the dashboard's copy, which holds the i18n instance.
- `@medusajs/medusa` is a devDependency because the `medusa` CLI needs it to run `plugin:build`. It pulls upstream `@medusajs/draft-order` into this repository's `node_modules`; the build doesn't use it.
- `eslint-plugin-react-hooks` is registered so upstream's `eslint-disable react-hooks/exhaustive-deps` comments resolve; lint passes with upstream's warnings.
- The built `.medusa/server` has the same files as the published upstream package. Before the translations the admin bundle had the same lines, in a different module order.

## Keys

- All keys are under `draftOrdersPlugin.*`. The dashboard deep-merges plugin resources over its own, so a plugin key equal to a dashboard key replaces the dashboard's text on every page; a prefix nobody else uses can't.
- The strings that already used dashboard keys keep them (`draftOrders.domain`, `draftOrders.list.*`, `actions.create`). So the list heading reads "Pedidos em Rascunho" in ptBR, the dashboard's wording, while the plugin's own strings say "pedido rascunho".
- The sidebar entry uses `defineRouteConfig({ label: "draftOrdersPlugin.menu.drafts", translationNs: "translation" })`, and the breadcrumb renders a component that calls `t()`.
- `@medusajs/ui` components that accept translations get them (DataTable toolbar and pagination, the convert prompt's buttons, the date filter's range labels). The combobox's popup button gets an `aria-label`, which replaces ariakit's English default.

## English stays upstream's

en.json repeats upstream's strings exactly, including its quirks, so English users see no change: the metadata badge always says "keys" ("1 keys"), the profile item count in the Shipping section has upstream's inverted plural ("1 items", "2 item"), and the zod messages are zod's own English. Fixing them belongs upstream. ptBR is grammatical in all of them.

## Plurals

The dashboard's language code for Brazilian Portuguese is `ptBR`, which isn't a BCP 47 tag: `Intl.PluralRules("ptBR")` throws, so i18next skips the plural suffixes and `t("key", { count })` falls back to English. The dashboard has the same problem (its JSON sections show "32 keys" in ptBR). The plugin computes the plural form itself with `Intl.PluralRules("pt-BR")` and passes it as the i18next context, which resolves the same `key_one`/`key_other` entries (`usePlural`, `getPluralForm`). Only `one` and `other` are used: Portuguese CLDR has a `many` form for millions, which would otherwise miss. CLDR counts 0 as `one` in Portuguese ("0 chave").

## Validation messages

zod's default messages are English and built at runtime. The forms pass a per-parse error map to `zodResolver(schema, { error })` (`useZodErrorMap`). It translates the issues these schemas raise (missing value, empty text, invalid email, invalid value/option, union); en.json repeats zod's English templates, so English is unchanged. Other issues keep zod's message. Custom issues (`superRefine` in the create form) set `params.i18nKey` instead of a message, and the map translates the key.

## Dates and countries

- Dates and relative times use date-fns with the admin language's locale (`ptBR` for ptBR, `enUS` otherwise, as upstream). The DataTable's date picker comes from `@medusajs/ui` and follows the browser.
- Country names: English keeps the plugin's own list (upstream's names and order). Other languages get `Intl.DisplayNames` names, sorted with `Intl.Collator`. That avoids ~250 translation keys and covers every language.
- Currency amounts keep upstream's formatting (browser locale).

## Left in English

Strings rendered inside components the plugin doesn't own and can't pass text to: `@medusajs/ui`'s Copy button ("Copy", "Copied", `aria-label="Copy code snippet"`), the date picker's `aria-label`s ("Date input", "Clear date"), and the DataTable filters' internal texts, which the plugin's filters don't show. The "JSON" heading, "SKU", "ID" and the "esc" key hint are the same in both languages.
