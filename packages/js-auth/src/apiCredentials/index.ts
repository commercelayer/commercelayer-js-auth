import { jwtDecode } from "../jwtDecode.js"
import { revoke } from "../revoke.js"
import type { RevokeReturn } from "../types/index.js"
import { hasOwner } from "../utils/hasOwner.js"
import { makeAuth } from "./apiCredentials.js"
import type { StorageValue, StoreOptions } from "./storage.js"
import type {
  ApiCredentialsAuthorization,
  AuthOptions,
  SetRequired,
} from "./types.js"

export type { ApiCredentialsAuthorization } from "./types.js"
export { type Storage, createCompositeStorage } from "./storage.js"

/**
 * [**Integrations**](https://docs.commercelayer.io/core/api-credentials#integration) are used
 * to develop backend integrations with any 3rd-party system.
 *
 * This helper manages the caching mechanism to avoid unnecessary API calls.
 */
export function makeIntegration(
  options: SetRequired<AuthOptions, "clientSecret">,
  store: Omit<StoreOptions, "customerStorage">,
): {
  options: SetRequired<AuthOptions, "clientSecret">
  /**
   * Get the current integration authorization.
   *
   * This will return the authorization from memory or storage.
   * If the authorization is not found or expired, it will fetch a new one.
   */
  getAuthorization: () => Promise<ApiCredentialsAuthorization>
  /**
   * Revoke the current integration authorization.
   *
   * This will remove the authorization from memory and storage, and revoke the access token.
   */
  revokeAuthorization: () => Promise<RevokeReturn>
} {
  const auth = makeAuth(options, store, true)

  return {
    options,
    getAuthorization: auth.getAuthorization,
    revokeAuthorization: async () => {
      const { ownerType: type, accessToken } = await auth.getAuthorization()

      if (type === "guest") {
        await auth.removeAuthorization({ type: "guest" })

        return await revoke({
          clientId: options.clientId,
          clientSecret: options.clientSecret,
          token: accessToken,
        })
      }

      return {}
    },
  }
}

/**
 * [**Sales channels**](https://docs.commercelayer.io/core/api-credentials#sales-channel) are used
 * to build any customer touchpoint (e.g. your storefront with a fully-functional shopping cart and checkout flow).
 *
 * This helper manages the caching mechanism to avoid unnecessary API calls
 * and provides methods to set and remove customer authorizations.
 */
export function makeSalesChannel(
  options: Omit<AuthOptions, "clientSecret">,
  store: StoreOptions,
): {
  options: Omit<AuthOptions, "clientSecret">
  /**
   * Get the current sales channel authorization.
   *
   * This will return the authorization from memory or storage.
   * If the authorization is not found or expired, it will fetch a new one.
   * IF the customer is logged in with a `refreshToken`, it will also attempt to refresh the token when expired.
   */
  getAuthorization: () => Promise<ApiCredentialsAuthorization>
  /**
   * Sets the customer authorization.
   * This will store the authorization in memory and storage.
   * It will also validate the access token to ensure it contains a valid customer owner.
   *
   * The option `refreshToken` is optional and can be used to set a refresh token for the customer (e.g. "remember me" functionality).
   * It will be used to refresh the access token when it expires.
   */
  setCustomer: (options: StorageValue) => Promise<ApiCredentialsAuthorization>
  /**
   * Logs out the current customer.
   *
   * This will remove the customer authorization from memory and storage, and revoke the access token.
   */
  logoutCustomer: () => Promise<RevokeReturn>
} {
  const auth = makeAuth(options, store)

  return {
    options,
    getAuthorization: auth.getAuthorization,
    setCustomer: async (options) => {
      const decodedJWT = jwtDecode(options.accessToken)

      if (hasOwner(decodedJWT.payload)) {
        return await auth.setAuthorization(options)
      }

      throw new Error(
        "The provided access token does not contain a valid customer owner.",
      )
    },
    logoutCustomer: async () => {
      const { ownerType: type, accessToken } = await auth.getAuthorization()

      if (type === "customer") {
        await auth.removeAuthorization({
          type: "customer",
        })

        return await revoke({
          clientId: options.clientId,
          token: accessToken,
        })
      }

      return {}
    },
  }
}
