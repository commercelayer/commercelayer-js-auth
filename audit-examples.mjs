// @ts-check

/**
 * This script will audit every pnpm example in the "examples" folder.
 * Example lock files are not committed, so a fresh lock file is generated before each audit:
 * this way the audit reflects the versions a user gets when installing the example today.
 */

import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, rmSync } from "node:fs"
import { join } from "node:path"

const examplesDir = "examples"

const examples = readdirSync(examplesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(examplesDir, entry.name))
  .filter((dir) => existsSync(join(dir, "pnpm-workspace.yaml")))

/** @param {string} args */
const pnpm = (args) =>
  spawnSync(`pnpm ${args}`, { stdio: "inherit", shell: true }).status === 0

const failed = examples.filter((dir) => {
  console.group(`Auditing ${dir}`)
  rmSync(join(dir, "pnpm-lock.yaml"), { force: true })
  const passed =
    pnpm(`install -C ${dir} --lockfile-only`) && pnpm(`audit -C ${dir}`)
  console.groupEnd()
  return !passed
})

if (failed.length > 0) {
  console.group("Audit failed for:")
  failed.forEach((dir) => {
    console.error("→", dir)
  })
  console.groupEnd()
  process.exit(1)
}
