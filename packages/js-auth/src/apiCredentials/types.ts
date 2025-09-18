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
   * @default false
   */
  debug?: boolean

  // dedupConcurrentCalls?: (
  //   fn: (...args: any[]) => any,
  // ) => (...args: any[]) => Promise<Awaited<ReturnType<typeof fn>>>
}
