import type { TBaseReturn } from "../types/base.js"
import type { AuthenticateOptions } from "../types/index.js"

export type ApiCredentialsAuthorization = TBaseReturn &
  (
    | {
        ownerType: "guest"
      }
    | {
        ownerType: "customer"
        ownerId: string
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
}
