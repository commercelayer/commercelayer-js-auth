import type { TBaseReturn } from "../types/base.js"
import type { AuthenticateOptions } from "../types/index.js"

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
   * ⚠️ **WARNING**: When enabled, full authorization objects (including access tokens
   * and refresh tokens) will be logged to the console. This is intended for local
   * development only.
   *
   * **Security considerations**:
   * - Tokens will be visible in browser DevTools or terminal output
   * - In serverless/edge environments (Cloudflare Workers, Vercel Functions), logs may be
   *   forwarded to external log aggregation services (e.g., Datadog, Sentry, Cloudflare Analytics)
   * - Avoid enabling debug mode in production or shared environments
   *
   * @default false
   */
  debug?: boolean

  // dedupConcurrentCalls?: (
  //   fn: (...args: any[]) => any,
  // ) => (...args: any[]) => Promise<Awaited<ReturnType<typeof fn>>>
}
