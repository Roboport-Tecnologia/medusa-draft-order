# medusa-draft-order

Roboport Tecnologia's fork of Medusa's draft order plugin, `@medusajs/draft-order`. It comes from [`packages/plugins/draft-order`](https://github.com/medusajs/medusa/tree/v2.21.1/packages/plugins/draft-order) in medusajs/medusa at tag `v2.21.1` (MIT, see `LICENSE`), and the first commit of this repository is that directory unchanged.

## What it changes

- **Admin translations.** Upstream hardcodes its admin strings in English. Here every user-visible string goes through react-i18next's `t()`, and the plugin ships English and Brazilian Portuguese (`src/admin/i18n`). The pages follow the language picked in the admin profile. English reads as upstream, word for word. Dates and relative times are formatted with date-fns in the admin language, country names come from `Intl.DisplayNames`, and the forms' validation messages are translated too.
- **Standalone build.** npm with a lockfile and exact pins instead of the Medusa monorepo's yarn workspace; releases go to a `dist` branch.

The backend part (an empty `src/index.ts` plus types) and the routes, API calls and behavior are upstream's.

## Installing it in an app

The package keeps the name `@medusajs/draft-order`. Medusa's `defineConfig` always registers the plugin `{ resolve: "@medusajs/draft-order" }`, and `@medusajs/medusa` depends on `"@medusajs/draft-order": "2.21.1"`, so an app swaps the fork in by depending on it under that name and overriding the transitive copy:

```json
{
  "dependencies": {
    "@medusajs/draft-order": "github:Roboport-Tecnologia/medusa-draft-order#dist"
  },
  "overrides": {
    "@medusajs/draft-order": "$@medusajs/draft-order"
  }
}
```

Then `npm install` and check that there is a single copy, the fork's:

```bash
npm ls @medusajs/draft-order
# ├── @medusajs/draft-order@2.21.1-roboport.1 overridden
# └─┬ @medusajs/medusa@2.21.1
#   └── @medusajs/draft-order@2.21.1-roboport.1 deduped
```

The version suffix (`-roboport.N`) doesn't satisfy `@medusajs/medusa`'s `"2.21.1"`, so a missing or ineffective override shows up in `npm ls` as an upstream `2.21.1` copy or as `invalid`, instead of going unnoticed. Nothing in Medusa reads the plugin's version.

In an **npm workspace** (an app in `apps/backend`), npm only reads overrides from the root `package.json`, and a `$` reference there needs a root dependency. Declare the plugin at the root too:

```json
{
  "devDependencies": {
    "@medusajs/draft-order": "file:apps/backend/.yalc/@medusajs/draft-order"
  },
  "overrides": {
    "@medusajs/draft-order": "$@medusajs/draft-order"
  }
}
```

A `file:` path written directly as the override value doesn't work: npm resolves it relative to each package that depends on it. Overrides also don't reach packages npm already placed in the workspace's own `node_modules`; if `npm ls` still shows an upstream copy under `@medusajs/medusa`, delete that `@medusajs/medusa` entry from `package-lock.json` and run `npm install` again.

For local development, `npx medusa plugin:publish` here and `npx medusa plugin:add @medusajs/draft-order` in the app install it through yalc (`npm run dev` here republishes on every change).

## Translations

- `src/admin/i18n/json/en.json` and `ptBR.json` hold the strings, all under `draftOrdersPlugin.*` so they can't replace the dashboard's keys or another plugin's. `src/admin/i18n/index.ts` exports them in the admin plugin format (`{ en: { translation }, ptBR: { translation } }`); the dashboard deep-merges them over its own resources.
- The list heading, its empty states and the Create button keep upstream's dashboard keys (`draftOrders.*`, `actions.create`).
- `npm run check:i18n` fails when a language lacks a key en has, or when the code names a key en doesn't have.
- To add a language, add `json/<code>.json` with the dashboard's language code (`src/i18n/languages.ts` in `@medusajs/dashboard`) and register it in `index.ts`. For dates in that language, map the code to a date-fns locale in `src/admin/lib/utils/locale-utils.ts`.

## Development

```bash
npm install
npm run build        # medusa plugin:build, output in .medusa/server
npm run check:i18n
npm run lint
npm run dev          # rebuilds and pushes to apps linked with yalc
```

Release: commit, then `npm run release:github`. It builds and pushes `.medusa/server`, `README.md`, `LICENSE` and a `package.json` without scripts or devDependencies to the `dist` branch, and apps pick it up with `npm update @medusajs/draft-order`.

## Moving to a new Medusa version

1. Get upstream's changes to the plugin between the two tags: `git clone --filter=blob:none https://github.com/medusajs/medusa` and `git -C medusa diff v2.21.1 v2.22.0 -- packages/plugins/draft-order`.
2. Apply them here. Run new or changed strings through `t()`: add the keys to `en.json` with upstream's wording, then to `ptBR.json`.
3. Set `version` to `<new version>-roboport.1` and move the `@medusajs/*` pins, and the other dependencies, to the versions the new `@medusajs/medusa` resolves (`node_modules/@medusajs/draft-order` in an app's `package-lock.json`).
4. `npm install`, `npm run build`, `npm run check:i18n`, `npm run lint`. Compare `.medusa/server` with the upstream package's (`npm pack @medusajs/draft-order@<version>`): the same files, with the admin bundle differing only in the strings.
5. Commit, release, and upgrade the apps' Medusa packages together with `npm update @medusajs/draft-order`.

Decisions are recorded in `docs/decisions.md`.
