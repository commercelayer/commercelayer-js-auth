import { hasOwner } from "src/utils/hasOwner.js"
import { authenticate } from "../authenticate.js"
import { jwtDecode } from "../jwtDecode.js"
import type {
  AuthOptions,
  Authorization,
  StorageValue,
  StoreOptions,
} from "./types.js"

export function makeAuth(options: AuthOptions, store: StoreOptions) {
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

  async function getAuthorization(): Promise<Authorization> {
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
      throw new Error("Fetching a customer authorization should never happen.")
    }

    const customerAuthorization_fromMemory = toAuthorization(customerMemoryItem)

    const customerAuthorization =
      customerAuthorization_fromMemory ??
      toAuthorization(
        await (store.customerStorage ?? store.storage).getItem(customerKey),
      )

    if (customerAuthorization != null) {
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

    if (guestAuthorization != null && guestAuthorization.expires > new Date()) {
      log(
        `Found guest authorization in storage${guestAuthorization_fromMemory != null ? " (from memory)" : ""}`,
        guestAuthorization,
      )

      memoryStorage.setItem(guestKey, {
        accessToken: guestAuthorization.accessToken,
        scope: guestAuthorization.scope,
        refreshToken: guestAuthorization.refreshToken,
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
  ): Promise<Authorization> {
    const authorization = toAuthorization(auth)

    const key = await getStorageKey(
      { clientId: options.clientId, scope: auth.scope },
      authorization.type,
    )

    memoryStorage.setItem(key, {
      accessToken: authorization.accessToken,
      scope: authorization.scope,
      refreshToken: authorization.refreshToken,
    })

    await (authorization.type === "customer"
      ? (store.customerStorage ?? store.storage)
      : store.storage
    ).setItem(key, {
      accessToken: authorization.accessToken,
      scope: authorization.scope,
      refreshToken: authorization.refreshToken,
    })

    log("Stored authorization in memory and storage", authorization)

    return authorization
  }

  async function removeAuthorization({
    type,
  }: { type: Authorization["type"] }): Promise<void> {
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
): Options extends null ? Authorization | null : Authorization {
  if (options == null) {
    return null as Options extends null ? Authorization | null : Authorization
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
    ? ({ type: "customer", customerId: decodedJWT.payload.owner.id } as const)
    : ({ type: "guest" } as const)

  const expiresIn = Math.round(decodedJWT.payload.exp - Date.now() / 1000)

  const authorization: Authorization = {
    ...type,
    tokenType: "bearer",
    createdAt: decodedJWT.payload.iat,
    scope: options.scope,
    accessToken: options.accessToken,
    refreshToken: options.refreshToken,
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
