/**
 * The level of a debug log entry.
 *
 * - `"info"` — a meaningful event (cache miss, token refresh, authorization
 *   stored/removed, errors). Emitted when logLevel is `"info"` or `"verbose"`.
 * - `"verbose"` — a steady-state operation (storage read, cache hit).
 *   Emitted only when logLevel is `"verbose"`.
 */
type DebugLogLevel = "info" | "verbose"

/**
 * Fine-grained debug configuration.
 *
 * Pass this as the `debug` option to `makeSalesChannel`, `makeIntegration`,
 * or `createCompositeStorage`.
 */
export type DebugConfig = {
  /**
   * The log level.
   *
   * - `"info"` — logs meaningful events only (cache miss, token refresh,
   *   authorization stored/removed, errors). Routine cache hits are not logged,
   *   making it suitable for setups that call `getAuthorization()` on every API request.
   * - `"verbose"` — also logs steady-state operations (every storage read and cache hit).
   */
  logLevel: DebugLogLevel
  /**
   * Whether to partially mask access tokens and refresh tokens in the log output
   * (e.g. `eyJh...A9Xz`). Useful when logs are forwarded to external services
   * (e.g. Datadog, Sentry).
   *
   * @default true
   */
  maskToken?: boolean
}

type DebugLog = (
  level: DebugLogLevel,
  storageName: string | undefined,
  message: string,
  ...args: unknown[]
) => void

function maskToken<T>(value: T): T | string {
  if (typeof value !== "string" || value.length <= 8) {
    return value
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

function redactArgs(args: unknown[]): unknown[] {
  return args.map((arg) => {
    if (arg !== null && typeof arg === "object" && "accessToken" in arg) {
      return {
        ...arg,
        accessToken: maskToken(arg.accessToken),
        ...("refreshToken" in arg
          ? { refreshToken: maskToken(arg.refreshToken) }
          : {}),
      }
    }
    return arg
  })
}

/**
 * Creates the debug logger used by `makeAuth` and `createCompositeStorage`.
 */
export function createDebugLog({
  debug,
  logPrefix,
}: {
  debug: DebugConfig | undefined
  logPrefix: string
}): DebugLog {
  return (level, storageName, message, ...args) => {
    if (debug == null) {
      return
    }

    if (level === "verbose" && debug.logLevel !== "verbose") {
      return
    }

    const prefix = `[CommerceLayer • auth.js] [${logPrefix}]${storageName != null ? ` [${storageName}]` : ""} ${message}`
    const finalArgs = (debug.maskToken ?? true) ? redactArgs(args) : args

    console.log(prefix, ...finalArgs)
  }
}
