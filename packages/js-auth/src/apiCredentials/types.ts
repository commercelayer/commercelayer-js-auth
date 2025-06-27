import type { TBaseReturn } from "src/types/base.js"
import type {
  AuthenticateOptions,
  AuthenticateReturn,
} from "src/types/index.js"

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

export type StoreOptions = {
  /**
   * Function to get the key for storing the authorization in the storage.
   * This function receives the configuration and the type of authorization
   * and should return a unique key for that authorization.
   */
  getKey?: (
    configuration: {
      clientId: string
      scope?: string
    },
    type: ApiCredentialsAuthorization["ownerType"],
  ) => Promise<string>
  /**
   * Storage instance for storing authorizations.
   * This storage will be used for both "guest" and "customer" authorizations.
   *
   * If you need to use a different store for "customer" authorizations,
   * you can provide a different storage instance using `customerStorage` option.
   */
  storage: Storage
  /**
   * Storage instance for storing "customer" authorizations.
   * If not provided, the `storage` option will be used.
   *
   * This is useful if you want to separate guest and customer authorizations,
   * for example, using `localStorage` for guest authorizations
   * and `sessionStorage` for customer authorizations.
   */
  customerStorage?: Storage
}

/**
 * Storage interface for managing key/value pairs.
 *
 * This interface is used to abstract the storage mechanism, allowing for different implementations (e.g., localStorage, sessionStorage, in-memory storage).
 */
export interface Storage {
  /**
   * Returns the current value associated with the given key, or null if the given key does not exist.
   */
  getItem: (key: string) => Promise<StorageValue | null>

  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   */
  setItem: (key: string, value: StorageValue) => Promise<void>

  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   */
  removeItem: (key: string) => Promise<void>
}

export type StorageValue = Pick<
  AuthenticateReturn<"password">,
  "accessToken" | "scope"
> & {
  refreshToken?: string
}
