# medusa-draft-order

Roboport Tecnologia's fork of `@medusajs/draft-order` (medusajs/medusa `packages/plugins/draft-order` at `v2.21.1`), with admin translations in en and ptBR. The package name stays `@medusajs/draft-order` on purpose: apps install it under that name and override `@medusajs/medusa`'s transitive copy (README, "Installing it in an app").

## Commands

- `npm run build` — `medusa plugin:build` (output in `.medusa/server`, the only published files)
- `npm run check:i18n` — every language has en's keys; every `draftOrdersPlugin.*` key the code names exists
- `npm run lint`
- `npm run dev` — rebuild on change and push to apps linked with yalc
- `npm run release:github` — build and push to the `dist` branch (commit first)
- `npx tsc --noEmit -p src/admin/tsconfig.json` has upstream's own errors (missing `lodash.*` types, `draft-order-details.ts`, react-hook-form generics). Don't add new ones.

## Layout

- `src/admin/i18n/json/{en,ptBR}.json` — the strings, all under `draftOrdersPlugin.*`; `src/admin/i18n/index.ts` exports them for the dashboard.
- `src/admin/hooks/common/use-plural.tsx` — `t()` for `_one`/`_other` keys (see "Plurals" in `docs/decisions.md`). Use it, not `t(key, { count })`, for plural keys.
- `src/admin/hooks/common/use-date.tsx` — date-fns formatting in the admin language; `use-country-name.tsx` — country names; `use-zod-error-map.tsx` — translated zod messages, passed as `zodResolver(schema, { error: zodErrorMap })`.
- `src/admin/lib/utils/locale-utils.ts` — dashboard language code to BCP 47 tag, date-fns locale and plural form.
- `scripts/release-github.sh`, `scripts/dev.mjs`, `scripts/check-i18n.mjs`.

## Conventions

- Keep the diff with upstream small: translate strings, don't refactor, rename or fix upstream code. English must read exactly as upstream, including its quirks (see `docs/decisions.md`).
- Every user-visible string goes through `t()`. No hardcoded English in `src/admin`, no string concatenation for sentences: use interpolation and plural keys. Custom zod issues carry `params: { i18nKey }` instead of a message.
- New keys go under `draftOrdersPlugin.*`, in en and ptBR together. Upstream's existing dashboard keys (`draftOrders.domain`, `draftOrders.list.*`, `actions.create`) stay as they are.
- ptBR wording follows the dashboard's `ptBR.json` and the Roboport plugins: "pedido rascunho", "Canal de venda", "Endereço de entrega/cobrança", "E-mail", "Complemento".
- Dependencies are pinned to exact versions (`"2.21.1"`, never `^` or `~`): dependencies, dev, peer and overrides. `.npmrc` sets `save-exact=true`. The runtime dependencies match what an app resolves for upstream's ranges.
- `version` is the upstream version plus `-roboport.N`; bump N for each release on the same upstream version.
- Record decisions in `docs/decisions.md`, not in private assistant memory.
