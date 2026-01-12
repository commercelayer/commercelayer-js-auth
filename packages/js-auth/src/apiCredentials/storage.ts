import type { AuthenticateReturn } from "../types/index.js"
import type { ApiCredentialsAuthorization } from "./types.js"

/**
 * Creates a composite storage that combines multiple storages.
 *
 * When retrieving an item, it returns the first non-null value from the configured storages.
 *
 * The order of the configured storages is important, as it determines priority. The first storage in the array is checked first, followed by the second, and so on.
 *
 * Using a composite storage can be useful for reducing the load on the underlying storage.
 * For example, if you want to use Redis but avoid hitting it on every request, you can use a memory storage as the first storage and Redis as the second.
 * This way, the memory storage is checked first, and if the item is not found there, it falls back to Redis and is then saved to memory for subsequent requests.
 *
 * When setting or removing an item, the operation is performed on all configured storages to ensure consistency.
 *
 * @param options - An object containing an array of storage instances to combine and optionally a name.
 * @returns A composite storage instance.
 *
 * @example
 * const compositeStorage = createCompositeStorage({
 *   name: "composite-storage",
 *   storages: [memoryStorage, redisStorage]
 * });
 *
 * const value = await compositeStorage.getItem('myKey');
 *
 * // If you set the `name` property on the individual storages,
 * // the returned value will include the `storageName` indicating which storage provided the value.
 */
export function createCompositeStorage(options: {
  storages: Storage[]
  name?: string
}): Storage

/**
 * Creates a composite storage that combines multiple storages.
 *
 * @deprecated Use `createCompositeStorage` with options object instead.
 */
export function createCompositeStorage(storages: Storage[]): Storage
// TODO: remember to remove the deprecated overload in the next major release

export function createCompositeStorage(
  // TODO: remember to remove the deprecated overload in the next major release
  storagesOrOptions: Storage[] | { storages: Storage[]; name?: string },
): Storage {
  // TODO: remember to remove the deprecated overload in the next major release
  const options = Array.isArray(storagesOrOptions)
    ? { storages: storagesOrOptions }
    : storagesOrOptions

  return {
    name: options.name,

    async getItem(key: string) {
      for (const storage of options.storages) {
        const value = await storage.getItem(key)

        if (value !== null) {
          for (const previousStorage of options.storages.slice(
            0,
            options.storages.indexOf(storage),
          )) {
            await previousStorage.setItem(key, value)
          }

          return {
            ...value,
            storageName: storage.name,
          }
        }
      }
      return null
    },

    async setItem(key: string, value: StorageValue) {
      await Promise.all(
        options.storages.map((storage) => storage.setItem(key, value)),
      )
    },

    async removeItem(key: string) {
      await Promise.all(
        options.storages.map((storage) => storage.removeItem(key)),
      )
    },

    async dispose() {
      await Promise.all(options.storages.map((storage) => storage.dispose?.()))
    },
  }
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
      scope: string
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
 *
 * **Naming Best Practice**: It's highly recommended to provide a `name` for your storage instances.
 * This enables better observability in debug logs, especially when using composite storages,
 * as it allows you to trace which storage layer (memory, Redis, localStorage, etc.) provided each value.
 *
 * @example
 * ```typescript
 * const memoryStorage = {
 *   name: "memory",
 *   async getItem(key: string) { ... },
 *   async setItem(key: string, value: StorageValue) { ... },
 *   ...
 * }
 *
 * ```
 */
export interface Storage {
  /**
   * Optional name of the storage for identification purposes.
   *
   * **Recommended**: Provide a descriptive name (e.g., "memory-cache", "redis", "localStorage")
   * to improve debug log traceability, especially when using composite storages.
   */
  name?: string

  /**
   * Returns the current value associated with the given key, or null if the given key does not exist.
   */
  getItem: (key: string) => Promise<
    | (StorageValue & {
        /**
         * The name of the storage from which the item was retrieved.
         */
        storageName?: string
      })
    | null
  >

  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   */
  setItem: (key: string, value: StorageValue) => Promise<void>

  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   */
  removeItem: (key: string) => Promise<void>

  /**
   * Disposes all mounted storages to ensure there are no open-handles left.
   * Call it before exiting process.
   */
  dispose?: () => Promise<void>
}

export type StorageValue = Pick<
  AuthenticateReturn<"password">,
  "accessToken" | "scope"
> & {
  /**
   * The refresh token. If present, it can be used to obtain a new access token.
   */
  refreshToken?: string
}
