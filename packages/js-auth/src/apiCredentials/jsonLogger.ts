import type { DebugLogEntry } from "./debugLog.js"

/**
 * Writes each debug entry as one JSON object on a single line, for log
 * collectors that read stdout and would split a multi-line entry apart.
 *
 * Pass it as the `logger` debug option:
 *
 * ```ts
 * debug: { logLevel: "info", logger: jsonLogger }
 * ```
 */
export function jsonLogger(entry: DebugLogEntry): void {
  console.log(toJsonLine(entry))
}

/**
 * Serializes an entry to a single line of JSON.
 *
 * `Error` instances are expanded (they'd otherwise serialize to `{}`), and an
 * object that contains itself is replaced with `"[Circular]"`, so this never
 * throws on a log call.
 */
function toJsonLine(entry: DebugLogEntry): string {
  /** The objects on the path from the root to the value being serialized, with what each was serialized as. */
  const ancestors: Array<{ original: object; serialized: object }> = []

  function replacer(this: unknown, _key: string, value: unknown): unknown {
    if (typeof value === "bigint") {
      return value.toString()
    }

    if (typeof value !== "object" || value === null) {
      return value
    }

    // `this` is the object holding `value`: drop the ancestors we have left.
    while (
      ancestors.length > 0 &&
      ancestors[ancestors.length - 1]?.serialized !== this
    ) {
      ancestors.pop()
    }

    if (ancestors.some(({ original }) => original === value)) {
      return "[Circular]"
    }

    const serialized =
      value instanceof Error
        ? {
            ...value,
            name: value.name,
            message: value.message,
            stack: value.stack,
            cause: value.cause,
          }
        : value

    ancestors.push({ original: value, serialized })

    return serialized
  }

  const base = {
    name: "@commercelayer/js-auth",
    level: entry.level,
    source: entry.source,
    storageName: entry.storageName,
    message: entry.message,
  }

  try {
    return JSON.stringify(
      {
        ...base,
        data: entry.data.length > 0 ? entry.data : undefined,
      },
      replacer,
    )
  } catch {
    return JSON.stringify(base)
  }
}
