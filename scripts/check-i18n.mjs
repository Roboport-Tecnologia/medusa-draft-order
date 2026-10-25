// Checks the admin translations in src/admin/i18n/json:
// - every language has exactly the keys of en.json (plural keys included);
// - every "draftOrdersPlugin.*" key the admin code names exists in en.json,
//   either as is or with _one/_other forms.
// Usage: node scripts/check-i18n.mjs. Exits 1 on any problem.
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const jsonDir = path.join(root, "src/admin/i18n/json")
const adminDir = path.join(root, "src/admin")

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]]
  )

const load = (file) => new Map(flatten(JSON.parse(readFileSync(path.join(jsonDir, file), "utf8"))))

const problems = []
const en = load("en.json")

for (const file of readdirSync(jsonDir).filter((f) => f.endsWith(".json") && f !== "en.json")) {
  const other = load(file)
  for (const key of en.keys()) {
    if (!other.has(key)) problems.push(`${file}: missing ${key}`)
    else if (typeof other.get(key) !== "string" || !other.get(key).trim()) problems.push(`${file}: empty ${key}`)
  }
  for (const key of other.keys()) {
    if (!en.has(key)) problems.push(`${file}: ${key} isn't in en.json`)
  }
}

const sources = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name)
    if (statSync(file).isDirectory()) return name === "i18n" ? [] : sources(file)
    return /\.(tsx?|jsx?)$/.test(name) ? [file] : []
  })

const used = new Set()
for (const file of sources(adminDir)) {
  for (const [, key] of readFileSync(file, "utf8").matchAll(/"(draftOrdersPlugin\.[\w.]+)"/g)) used.add(key)
}
for (const key of used) {
  if (!en.has(key) && !(en.has(`${key}_one`) && en.has(`${key}_other`))) {
    problems.push(`src/admin: ${key} isn't in en.json`)
  }
}

for (const problem of problems) console.error(problem)
console.log(`${en.size} keys in en.json, ${used.size} named in src/admin, ${problems.length} problems`)
process.exitCode = problems.length ? 1 : 0
