#!/bin/sh
# Builds the plugin and pushes the build to the `dist` branch, which apps
# install from GitHub under the upstream package name:
#   "@medusajs/draft-order": "github:Roboport-Tecnologia/medusa-draft-order#<build commit sha>"
# (plus an npm `overrides` entry, see the README). The build isn't committed
# on main, and a git install can't build the plugin itself (the build needs
# the devDependencies), hence the branch.
set -eu

branch=dist
cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "Commit your changes first: the $branch commit names the source commit." >&2
  exit 1
fi
sha=$(git rev-parse --short HEAD)
remote=$(git remote get-url origin)

npm run build

out=$(mktemp -d)
trap 'rm -rf "$out"' EXIT
if git ls-remote --exit-code --heads origin "$branch" >/dev/null; then
  git clone --quiet --depth 1 --branch "$branch" "$remote" "$out"
  git -C "$out" rm -rq --ignore-unmatch .
else
  git init --quiet -b "$branch" "$out"
  git -C "$out" remote add origin "$remote"
fi

mkdir -p "$out/.medusa"
cp -R .medusa/server "$out/.medusa/server"
for f in README.md LICENSE; do
  if [ -f "$f" ]; then cp "$f" "$out/"; fi
done
# Without scripts, npm installs the branch as is instead of trying to build it.
node -e '
  const pkg = require("./package.json")
  delete pkg.scripts
  delete pkg.devDependencies
  require("fs").writeFileSync(process.argv[1], JSON.stringify(pkg, null, 2) + "\n")
' "$out/package.json"

git -C "$out" add -A -f
if git -C "$out" diff --cached --quiet; then
  echo "$branch is already up to date with $sha: $(git -C "$out" rev-parse HEAD)"
  exit 0
fi
git -C "$out" commit --quiet -m "Build of $sha"
git -C "$out" push --quiet origin "$branch"
echo "Pushed the build of $sha to $branch: $(git -C "$out" rev-parse HEAD)"
echo "Apps pin that commit SHA, never the branch: github:<owner>/<repo>#<sha>."
