// @ts-check

/**
 * This script will replace all "version number" occurrences in jsr.json files so that it will point to the latest version.
 * This script runs on "version lifecycle" - https://github.com/lerna/lerna/blob/main/commands/version/README.md#lifecycle-scripts
 */

import { replaceInFileSync } from 'replace-in-file'
import lernaJson from "./lerna.json" with { type: "json" }

const options = {
  dry: false,
  files: ["./packages/**/jsr.json"],
  from: /("version":\s")([0-9a-z.\-]+)(",)/,
  to: `$1${lernaJson.version}$3`,
}

try {
  const results = replaceInFileSync(options)
  const filteredResults = results.filter((r) => r.hasChanged).map((r) => r.file)

  if (filteredResults.length > 0) {
    console.group('Updating "Package" version for https://jsr.io:')
    filteredResults.forEach((r) => {
      console.info('→', r)
    })
    console.groupEnd()
  }
} catch (error) {
  console.error('Error occurred:', error)
}
