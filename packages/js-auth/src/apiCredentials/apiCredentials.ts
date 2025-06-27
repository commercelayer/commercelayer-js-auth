import { authenticate } from "../authenticate.js"
import { jwtDecode } from "../jwtDecode.js"
import { hasOwner } from "../utils/hasOwner.js"
import type {
  ApiCredentialsAuthorization,
  AuthOptions,
  StorageValue,
  StoreOptions,
} from "./types.js"

export function makeAuth(
  options: AuthOptions,
  store: StoreOptions,
  /**
   * Whether to allow only guest authorizations.
   * If set to `true`, the helper will only return guest authorizations
   * and will not attempt to read or refresh customer authorizations.
   * This is useful for integrations that do not require customer authentication,
   * such as backend integrations or public APIs.
   * @default false
   */
  guestOnly = false,
) {
  function log(message: string, ...args: unknown[]) {
    if (options.debug) {
      console.log(`[CommerceLayer • auth.js] ${message}`, ...args)
    }
  }

  const memoryStorage = makeMemoryStorage()

  const getStorageKey =
    store.getKey ??
    ((configuration, type) => {
      return `cl_${type}-${configuration.clientId}-${configuration.scope}`
    })

  async function getAuthorization(): Promise<ApiCredentialsAuthorization> {
    if (guestOnly === false) {
      // read `customer` authorization
      const customerKey = await getStorageKey(
        {
          clientId: options.clientId,
          scope: options.scope,
        },
        "customer",
      )

      const customerMemoryItem = memoryStorage.getItem(customerKey)

      if (customerMemoryItem === "fetching") {
        throw new Error(
          "Fetching a customer authorization should never happen.",
        )
      }

      const customerAuthorization_fromMemory =
        toAuthorization(customerMemoryItem)

      const customerAuthorization =
        customerAuthorization_fromMemory ??
        toAuthorization(
          await (store.customerStorage ?? store.storage).getItem(customerKey),
        )

      if (customerAuthorization?.ownerType === "customer") {
        if (customerAuthorization.expires > new Date()) {
          log(
            `Found customer authorization in storage${customerAuthorization_fromMemory != null ? " (from memory)" : ""}`,
            customerAuthorization,
          )

          memoryStorage.setItem(customerKey, {
            accessToken: customerAuthorization.accessToken,
            scope: customerAuthorization.scope,
            refreshToken: customerAuthorization.refreshToken,
          })

          return customerAuthorization
        }

        log("Customer authorization expired", customerAuthorization)

        // if customer token is expired, refresh it
        if (customerAuthorization.refreshToken != null) {
          const { accessToken, scope, refreshToken } = await authenticate(
            "refresh_token",
            {
              ...options,
              refreshToken: customerAuthorization.refreshToken,
            },
          )

          const authorization = await setAuthorization({
            accessToken,
            scope,
            refreshToken,
          })

          log("Refreshed customer authorization", authorization)

          return authorization
        }
      }
    }

    // read `guest` authorization
    const guestKey = await getStorageKey(
      {
        clientId: options.clientId,
        scope: options.scope,
      },
      "guest",
    )

    let memoryItem = memoryStorage.getItem(guestKey)
    if (memoryItem == null) {
      memoryStorage.setItem(guestKey, "fetching")
    }
    if (memoryItem === "fetching") {
      memoryItem = await memoryStorage.waitFor(guestKey)
    }

    const guestAuthorization_fromMemory = toAuthorization(memoryItem)

    const guestAuthorization = toAuthorization(
      guestAuthorization_fromMemory ?? (await store.storage.getItem(guestKey)),
    )

    if (
      guestAuthorization?.ownerType === "guest" &&
      guestAuthorization.expires > new Date()
    ) {
      log(
        `Found guest authorization in storage${guestAuthorization_fromMemory != null ? " (from memory)" : ""}`,
        guestAuthorization,
      )

      memoryStorage.setItem(guestKey, {
        accessToken: guestAuthorization.accessToken,
        scope: guestAuthorization.scope,
      })

      return guestAuthorization
    }

    // requesting a new token

    log("No valid authorization found, requesting a new guest token")

    // create `guest` authorization
    const { accessToken, scope } = await authenticate(
      "client_credentials",
      options,
    )

    const authorization = await setAuthorization({
      accessToken,
      scope,
    })

    return authorization
  }

  async function setAuthorization(
    auth: SetAuthorizationOptions,
  ): Promise<ApiCredentialsAuthorization> {
    const authorization = toAuthorization(auth)

    const key = await getStorageKey(
      { clientId: options.clientId, scope: auth.scope },
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

    memoryStorage.setItem(key, value)

    await (authorization.ownerType === "customer"
      ? (store.customerStorage ?? store.storage)
      : store.storage
    ).setItem(key, value)

    log("Stored authorization in memory and storage", authorization)

    return authorization
  }

  async function removeAuthorization({
    type,
  }: { type: ApiCredentialsAuthorization["ownerType"] }): Promise<void> {
    const key = await getStorageKey(
      { clientId: options.clientId, scope: options.scope },
      type,
    )

    memoryStorage.removeItem(key)

    await (type === "customer"
      ? (store.customerStorage ?? store.storage)
      : store.storage
    ).removeItem(key)

    log(`Removed "${type}" authorization from storage`, key)
  }

  return {
    options,
    getAuthorization,
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
    decodedJWT.payload.owner.type !== "Customer"
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

/**
 * A simple in-memory storage implementation.
 * It is used to reduce load on the underlying configured storage (e.g., Redis, DB) by caching tokens in memory.
 */
function makeMemoryStorage() {
  const data = new Map()

  return {
    getItem: (key: string): StorageValue | "fetching" | null => {
      return data.get(key) ?? null
    },
    waitFor: (key: string): Promise<StorageValue | null> => {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const value: StorageValue | "fetching" | null = data.get(key) ?? null
          if (value !== "fetching") {
            clearInterval(interval)
            resolve(value)
          }
        }, 100)
      })
    },
    setItem: (key: string, value: StorageValue | "fetching") => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
  }
}

type SetAuthorizationOptions = StorageValue
