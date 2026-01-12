import { authenticate } from "../authenticate.js"
import { jwtDecode } from "../jwtDecode.js"
import { hasOwner } from "../utils/hasOwner.js"
import { dedupConcurrentCalls } from "./dedupConcurrentCalls.js"
import type { StorageValue, StoreOptions } from "./storage.js"
import type {
  ApiCredentialsAuthorization,
  AuthOptions,
  SetRequired,
} from "./types.js"

type MakeAuthReturn = {
  options: AuthOptions
  getAuthorization: () => Promise<ApiCredentialsAuthorization>
  setAuthorization: (
    auth: SetAuthorizationOptions,
  ) => Promise<ApiCredentialsAuthorization>
  removeAuthorization: (
    type: ApiCredentialsAuthorization["ownerType"],
  ) => Promise<void>
}

function enhanceStorage<
  Storage extends StoreOptions["storage"] | StoreOptions["customerStorage"],
>(storage?: Storage): Storage {
  if (storage === undefined) {
    return storage as Storage
  }

  const originalGetItem = storage.getItem.bind(storage)

  return {
    ...storage,
    async getItem(key: string) {
      const value = await originalGetItem(key)
      return value != null
        ? {
            ...value,
            storageName: value.storageName ?? storage.name,
          }
        : null
    },
  }
}

function enhanceStoreOptions(store: StoreOptions): StoreOptions {
  return {
    ...store,
    storage: enhanceStorage(store.storage),
    customerStorage: enhanceStorage(store.customerStorage),
  }
}

export function makeAuth(
  options: AuthOptions,
  _store: StoreOptions,
  {
    logPrefix,
    guestOnly = false,
  }: {
    logPrefix: string
    /**
     * Whether to allow only guest authorizations.
     * If set to `true`, the helper will only return guest authorizations
     * and will not attempt to read or refresh customer authorizations.
     * This is useful for integrations that do not require customer authentication,
     * such as backend integrations or public APIs.
     * @default false
     */
    guestOnly?: boolean
  },
): MakeAuthReturn {
  const authOptions: SetRequired<AuthOptions, "scope"> = {
    ...options,
    scope: options.scope ?? "market:all",
  }

  const store = enhanceStoreOptions(_store)

  function log(
    storageName: string | undefined,
    message: string,
    ...args: unknown[]
  ) {
    if (authOptions.debug === true) {
      console.log(
        `[CommerceLayer • auth.js] [${logPrefix}]${storageName != null ? ` [${storageName}]` : ""} ${message}`,
        ...args,
      )
    }
  }

  const getStorageKey =
    store.getKey ??
    ((configuration, type) => {
      return `cl_${type}-${configuration.clientId}-${configuration.scope}`
    })

  const getAuthorization: MakeAuthReturn["getAuthorization"] = async () => {
    /**
     * Threshold duration before token expiration, in seconds.
     *
     * When `authorization.expiresIn` drops below this value,
     * a new token will be requested to prevent usage of a nearly expired token.
     *
     * According to the Commerce Layer documentation, a new token is issued
     * 15 minutes (900 seconds) before the previous token expires.
     * During this overlap window, both tokens are valid.
     *
     * @example
     * 600 seconds (10 minutes)
     */
    const expirationThreshold = 10 * 60

    try {
      if (guestOnly === false) {
        // read `customer` authorization
        const customerKey = await getStorageKey(
          {
            clientId: authOptions.clientId,
            scope: authOptions.scope,
          },
          "customer",
        )

        const storage = store.customerStorage ?? store.storage

        log(storage.name, "Checking for customer key:", customerKey)

        const storedValue = await storage.getItem(customerKey)
        const customerAuthorization = toAuthorization(storedValue)

        if (customerAuthorization?.ownerType === "customer") {
          if (customerAuthorization.expiresIn >= expirationThreshold) {
            log(
              storedValue?.storageName,
              'Found "customer" authorization in storage',
              customerAuthorization,
            )

            return customerAuthorization
          }

          log(
            storedValue?.storageName,
            "Customer authorization expired",
            customerAuthorization,
          )

          if (customerAuthorization.refreshToken != null) {
            const refreshTokenResponse = await authenticate("refresh_token", {
              ...authOptions,
              refreshToken: customerAuthorization.refreshToken,
            })

            const authorization = await setAuthorization({
              accessToken: refreshTokenResponse.accessToken,
              scope: refreshTokenResponse.scope,
              refreshToken: refreshTokenResponse.refreshToken,
            })

            log(
              storedValue?.storageName,
              "Refreshed customer authorization",
              authorization,
            )

            return authorization
          }
        }
      }

      // read `guest` authorization
      const guestKey = await getStorageKey(
        {
          clientId: authOptions.clientId,
          scope: authOptions.scope,
        },
        "guest",
      )

      const storage = store.storage

      log(storage.name, "Checking for guest key:", guestKey)

      const storedValue = await storage.getItem(guestKey)
      const guestAuthorization = toAuthorization(storedValue)

      if (
        guestAuthorization?.ownerType === "guest" &&
        guestAuthorization.expiresIn >= expirationThreshold
      ) {
        log(
          storedValue?.storageName,
          'Found "guest" authorization in storage',
          guestAuthorization,
        )

        return guestAuthorization
      }

      // requesting a new token

      log(
        storage.name,
        "No valid authorization found, requesting a new guest token",
      )

      // create `guest` authorization
      const clientCredentialsResponse = await authenticate(
        "client_credentials",
        authOptions,
      )

      const authorization = await setAuthorization({
        accessToken: clientCredentialsResponse.accessToken,
        scope: clientCredentialsResponse.scope,
      })

      return authorization
    } catch (error) {
      log(undefined, "Error getting the authorization.", error)
      throw error
    }
  }

  const setAuthorization: MakeAuthReturn["setAuthorization"] = async (auth) => {
    const authorization = toAuthorization(auth)

    const key = await getStorageKey(
      { clientId: authOptions.clientId, scope: auth.scope },
      authorization.ownerType,
    )

    const value: StorageValue = {
      accessToken: authorization.accessToken,
      scope: authorization.scope,
      refreshToken:
        authorization.ownerType === "customer"
          ? authorization.refreshToken
          : undefined,
    }

    const storage =
      authorization.ownerType === "customer"
        ? (store.customerStorage ?? store.storage)
        : store.storage

    log(
      storage.name,
      `Storing "${authorization.ownerType}" authorization with key:`,
      key,
    )

    await storage.setItem(key, value)

    log(
      storage.name,
      `Stored "${authorization.ownerType}" authorization to storage`,
      authorization,
    )

    return authorization
  }

  const removeAuthorization: MakeAuthReturn["removeAuthorization"] = async (
    type,
  ) => {
    const key = await getStorageKey(
      { clientId: authOptions.clientId, scope: authOptions.scope },
      type,
    )

    const storage =
      type === "customer"
        ? (store.customerStorage ?? store.storage)
        : store.storage

    await storage.removeItem(key)

    log(storage.name, `Removed "${type}" authorization with key:`, key)
  }

  return {
    options: authOptions,
    getAuthorization: dedupConcurrentCalls(getAuthorization),
    setAuthorization,
    removeAuthorization,
  }
}

/**
 * Converts the `SetAuthorizationOptions` into an `Authorization` object.
 */
function toAuthorization<Options extends SetAuthorizationOptions | null>(
  options: Options,
): Options extends null
  ? ApiCredentialsAuthorization | null
  : ApiCredentialsAuthorization {
  if (options == null) {
    return null as Options extends null
      ? ApiCredentialsAuthorization | null
      : ApiCredentialsAuthorization
  }

  const decodedJWT = jwtDecode(options.accessToken)

  if (
    hasOwner(decodedJWT.payload) &&
    decodedJWT.payload.owner.type.toLowerCase() !== "customer"
  ) {
    throw new Error(
      "The provided access token does not contain a valid customer owner.",
    )
  }

  const type = hasOwner(decodedJWT.payload)
    ? ({
        ownerType: "customer",
        ownerId: decodedJWT.payload.owner.id,
        refreshToken: options.refreshToken,
      } as const)
    : ({ ownerType: "guest" } as const)

  const expiresIn = Math.round(decodedJWT.payload.exp - Date.now() / 1000)

  const authorization: ApiCredentialsAuthorization = {
    ...type,
    tokenType: "bearer",
    createdAt: decodedJWT.payload.iat,
    scope: options.scope,
    accessToken: options.accessToken,
    expiresIn,
    expires: new Date(Date.now() + expiresIn * 1000),
  }

  return authorization
}

type SetAuthorizationOptions = StorageValue
