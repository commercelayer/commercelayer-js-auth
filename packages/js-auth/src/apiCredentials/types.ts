import type { TBaseReturn } from "../types/base.js"
import type { AuthenticateOptions } from "../types/index.js"
import type { DebugConfig } from "./debugLog.js"

export type ApiCredentialsAuthorization = TBaseReturn &
  (
    | {
        /**
         * The type of the token owner. It can be `guest` or `customer`.
         */
        ownerType: "guest"
      }
    | {
        /**
         * The type of the token owner. It can be `guest` or `customer`.
         */
        ownerType: "customer"
        /**
         * The ID of the token owner.
         */
        ownerId: string
        /**
         * The refresh token that can be used to obtain a new access token.
         */
        refreshToken?: string
      }
  )

export type SetRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>

export type AuthOptions = AuthenticateOptions<"client_credentials"> & {
  /**
   * Whether to enable debug mode.
   *
   * - `true` — shortcut for `{ logLevel: "info" }`: logs meaningful events only
   *   (cache misses, token refreshes, authorizations stored/removed, errors).
   *   Tokens are redacted by default.
   * - `DebugConfig` — fine-grained control:
   *   - `logLevel: "info"` — meaningful events only.
   *   - `logLevel: "verbose"` — also logs steady-state operations (every storage read and cache hit).
   *   - `maskToken` — whether to redact tokens (default `true`). Set to `false` to see
   *     full tokens, e.g. for inspecting them at [jwt.io](https://jwt.io).
   *
   * **Security considerations**:
   * - In serverless/edge environments (Cloudflare Workers, Vercel Functions), logs may be
   *   forwarded to external log aggregation services (e.g., Datadog, Sentry, Cloudflare Analytics)
   * - Avoid setting `maskToken: false` in production or shared environments
   */
  debug?: DebugConfig

  // dedupConcurrentCalls?: (
  //   fn: (...args: any[]) => any,
  // ) => (...args: any[]) => Promise<Awaited<ReturnType<typeof fn>>>
}
