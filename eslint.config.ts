import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"
import reactHooks from "eslint-plugin-react-hooks"

export default defineConfig([
  ...medusa.configs.recommended,
  {
    files: ["src/admin/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
])
