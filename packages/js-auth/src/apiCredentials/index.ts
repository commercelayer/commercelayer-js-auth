import { hasOwner } from "src/utils/hasOwner.js"
import { jwtDecode } from "../jwtDecode.js"
import { revoke } from "../revoke.js"
import { makeAuth } from "./apiCredentials.js"
import type {
  AuthOptions,
  Authorization,
  SetRequired,
  StorageValue,
  StoreOptions,
} from "./types.js"

export type { Storage } from "./types.js"

/**
 * [**Integrations**](https://docs.commercelayer.io/core/api-credentials#integration) are used
 * to develop backend integrations with any 3rd-party system.
 *
 * This helper manages the caching mechanism to avoid unnecessary API calls.
 */
export function makeIntegration(
  options: SetRequired<AuthOptions, "clientSecret">,
  store: Omit<StoreOptions, "customerStorage">,
) {
  const auth = makeAuth(options, store)

  return {
    options: auth.options,
    getAuthorization: auth.getAuthorization,
    /**
     * Revoke the current integration authorization.
     * This will remove the authorization from memory and storage, and revoke the access token.
     */
    revokeAuthorization: async () => {
      const { type, accessToken } = await auth.getAuthorization()

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
) {
  const auth = makeAuth(options, store)

  return {
    options: auth.options,
    getAuthorization: auth.getAuthorization,
    /**
     * Sets the customer authorization.
     *
     *
     */
    setCustomer: async (options: StorageValue): Promise<Authorization> => {
      const decodedJWT = jwtDecode(options.accessToken)

      if (hasOwner(decodedJWT.payload)) {
        return await auth.setAuthorization(options)
      }

      throw new Error(
        "The provided access token does not contain a valid customer owner.",
      )
    },
    /**
     * Logs out the current customer.
     *
     * This will remove the customer authorization from memory and storage, and revoke the access token.
     */
    logoutCustomer: async (): Promise<ReturnType<typeof revoke>> => {
      const { type, accessToken } = await auth.getAuthorization()

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
