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
 * A single debug log entry, handed to a custom `logger`.
 *
 * All token values in `data` are already masked when `maskToken` is enabled.
 */
export type DebugLogEntry = {
  /** The level of this entry. */
  level: DebugLogLevel
  /** What emitted the entry (e.g. `"sales_channel"`, `"integration"`, `"storage"`). */
  source: string
  /** The name of the storage involved, when there is one. */
  storageName?: string
  /** The human-readable message. */
  message: string
  /** Any structured values attached to the message (authorizations, keys, errors). */
  data: unknown[]
}

/**
 * How debug entries are written.
 *
 * - `"console"` (default) — `console.log(message, ...data)`, so objects stay
 *   inspectable in browser devtools and readable in a terminal.
 * - a function — receives the {@link DebugLogEntry} and writes it wherever you
 *   want (pino, winston, a remote service, …). Use `jsonLogger` to write one
 *   JSON object per line. Errors thrown by the function are ignored.
 */
export type DebugLogger = "console" | ((entry: DebugLogEntry) => void)

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
  /**
   * How entries are written: `"console"` (default) or your own function.
   *
   * @default "console"
   */
  logger?: DebugLogger
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

/** Formats the `[CommerceLayer • auth.js] [source] [storage] message` line written by the `"console"` logger. */
function formatPrefix(entry: DebugLogEntry): string {
  return `[CommerceLayer • auth.js] [${entry.source}]${entry.storageName != null ? ` [${entry.storageName}]` : ""} ${entry.message}`
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

    const entry: DebugLogEntry = {
      level,
      source: logPrefix,
      storageName,
      message,
      data: (debug.maskToken ?? true) ? redactArgs(args) : args,
    }

    const logger = debug.logger ?? "console"

    if (typeof logger === "function") {
      try {
        logger(entry)
      } catch {
        // A failing logger must not break the authorization flow it is logging.
      }
      return
    }

    console.log(formatPrefix(entry), ...entry.data)
  }
}
