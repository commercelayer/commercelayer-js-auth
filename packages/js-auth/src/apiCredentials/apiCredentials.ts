import { authenticate } from "../authenticate.js"
import { jwtDecode } from "../jwtDecode.js"
import { hasOwner } from "../utils/hasOwner.js"
import { dedupConcurrentCalls } from "./dedupConcurrentCalls.js"
import type { StorageValue, StoreOptions } from "./storage.js"
import type { ApiCredentialsAuthorization, AuthOptions } from "./types.js"

type MakeAuthReturn = {
  options: AuthOptions
  getAuthorization: () => Promise<ApiCredentialsAuthorization>
  setAuthorization: (
    auth: SetAuthorizationOptions,
  ) => Promise<ApiCredentialsAuthorization>
  removeAuthorization: (params: {
    type: ApiCredentialsAuthorization["ownerType"]
  }) => Promise<void>
}

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
): MakeAuthReturn {
  function log(message: string, ...args: unknown[]) {
    if (options.debug === true) {
      console.log(`[CommerceLayer • auth.js] ${message}`, ...args)
    }
  }

  const getStorageKey =
    store.getKey ??
    ((configuration, type) => {
      return `cl_${type}-${configuration.clientId}-${configuration.scope}`
    })

  const getAuthorization: MakeAuthReturn["getAuthorization"] = async () => {
    try {
      if (guestOnly === false) {
        // read `customer` authorization
        const customerKey = await getStorageKey(
          {
            clientId: options.clientId,
            scope: options.scope,
          },
          "customer",
        )

        const customerAuthorization = toAuthorization(
          await (store.customerStorage ?? store.storage).getItem(customerKey),
        )

        if (customerAuthorization?.ownerType === "customer") {
          if (customerAuthorization.expires > new Date()) {
            log(
              "Found customer authorization in storage",
              customerAuthorization,
            )

            return customerAuthorization
          }

          log("Customer authorization expired", customerAuthorization)

          // if customer token is expired, refresh it
          if (customerAuthorization.refreshToken != null) {
            const refreshTokenResponse = authenticate("refresh_token", {
              ...options,
              refreshToken: customerAuthorization.refreshToken,
            })

            const { accessToken, scope, refreshToken } =
              await refreshTokenResponse

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

      const guestAuthorization = toAuthorization(
        await store.storage.getItem(guestKey),
      )

      if (
        guestAuthorization?.ownerType === "guest" &&
        guestAuthorization.expires > new Date()
      ) {
        log("Found guest authorization in storage", guestAuthorization)

        return guestAuthorization
      }

      // requesting a new token

      log("No valid authorization found, requesting a new guest token")

      // create `guest` authorization
      const clientCredentialsResponse = authenticate(
        "client_credentials",
        options,
      )

      const { accessToken, scope } = await clientCredentialsResponse

      const authorization = await setAuthorization({
        accessToken,
        scope,
      })

      return authorization
    } catch (error) {
      log("Error getting the authorization.", error)
      throw error
    }
  }

  const setAuthorization: MakeAuthReturn["setAuthorization"] = async (auth) => {
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

    await (authorization.ownerType === "customer"
      ? (store.customerStorage ?? store.storage)
      : store.storage
    ).setItem(key, value)

    log("Stored authorization in storage", authorization)

    return authorization
  }

  const removeAuthorization: MakeAuthReturn["removeAuthorization"] = async ({
    type,
  }) => {
    const key = await getStorageKey(
      { clientId: options.clientId, scope: options.scope },
      type,
    )

    await (type === "customer"
      ? (store.customerStorage ?? store.storage)
      : store.storage
    ).removeItem(key)

    log(`Removed "${type}" authorization from storage`, key)
  }

  return {
    options,
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
