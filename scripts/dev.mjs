// `npm run dev`: rebuilds the plugin on every save and pushes it to the apps
// linked to it with yalc (`npm run plugins:local` in the app).
//
// `medusa plugin:develop` handles the backend, but it neither builds nor
// watches the admin extensions, and its startup build deletes their output:
// without this script, the first push after starting it ships the plugin with
// no admin. So the admin is built once after that startup build, and again
// after every change under src/admin.
import { execFile, spawn } from "node:child_process"
import { createRequire } from "node:module"
import path from "node:path"
import chokidar from "chokidar"

const root = process.cwd()
const require = createRequire(path.join(root, "package.json"))
const yalcBin = path.join(path.dirname(require.resolve("yalc")), "yalc.js")
const medusaBin = path.join(root, "node_modules", ".bin", "medusa")
const adminDir = path.join(root, "src", "admin")

const bundler = await import(require.resolve("@medusajs/admin-bundler"))

let building = false
let pending = false

async function buildAdmin() {
  if (building) {
    pending = true
    return
  }
  building = true
  const started = Date.now()
  try {
    await bundler.plugin({ root, outDir: ".medusa/server" })
    console.log(`admin extensions built (${((Date.now() - started) / 1000).toFixed(1)}s), publishing`)
    await publish()
  } catch (error) {
    console.error("admin extensions build failed:", error.message)
  } finally {
    building = false
    if (pending) {
      pending = false
      buildAdmin()
    }
  }
}

function publish() {
  return new Promise((resolve) => {
    execFile(process.execPath, [yalcBin, "publish", "--push", "--no-scripts"], { cwd: root }, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr || error.message)
      } else {
        process.stdout.write(stdout)
      }
      resolve()
    })
  })
}

const develop = spawn(medusaBin, ["plugin:develop"], { cwd: root, stdio: ["inherit", "pipe", "inherit"] })
develop.on("exit", (code) => process.exit(code ?? 0))
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => develop.kill(signal))
}

let adminWatched = false
develop.stdout.on("data", (chunk) => {
  process.stdout.write(chunk)
  // plugin:develop prints this once its startup build is done.
  if (!adminWatched && chunk.toString().includes("watching for file changes")) {
    adminWatched = true
    watchAdmin()
  }
})

function watchAdmin() {
  buildAdmin()
  let timer
  chokidar
    .watch(adminDir, {
      ignoreInitial: true,
      // Each build writes and deletes src/admin/__admin-extensions__.js.
      ignored: (file, stats) =>
        path.basename(file).startsWith("__") ||
        (!!stats?.isFile() && !/\.(tsx?|jsx?|css|json)$/.test(file)),
    })
    .on("all", () => {
      clearTimeout(timer)
      timer = setTimeout(buildAdmin, 200)
    })
}
