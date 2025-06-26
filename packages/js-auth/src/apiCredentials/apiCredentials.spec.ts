import { authenticate } from "../authenticate.js"
import { type Storage, makeIntegration, makeSalesChannel } from "./index.js"

const clientId = process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID
const integrationClientId = process.env.VITE_TEST_INTEGRATION_CLIENT_ID
const clientSecret = process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET
const domain = process.env.VITE_TEST_DOMAIN
const scope = process.env.VITE_TEST_SCOPE
const username = process.env.VITE_TEST_USERNAME
const password = process.env.VITE_TEST_PASSWORD

describe("API Credentials", () => {
  describe("makeSalesChannel", () => {
    it("should have a built-in memory cache that reduces load on the underlying configured storage.", async () => {
      const storage = makeMockedStorage()

      const salesChannel = makeSalesChannel(
        {
          clientId,
          scope,
          domain,
        },
        {
          storage,
        },
      )

      const authorization = await salesChannel.getAuthorization() // 2 calls - first one is to check customer token and second one is to check guest token

      await salesChannel.getAuthorization() // 1 call - to check customer token (guest token is already in the built-in memory cache)
      const lastAuthorization = await salesChannel.getAuthorization() // 1 call - to check customer token (guest token is already in the built-in memory cache)

      expect(authorization.accessToken).toBeTypeOf("string")
      expect(authorization.createdAt).toBeTypeOf("number")
      expect(authorization.expires).toBeInstanceOf(Date)
      expect(authorization.expiresIn).toBeTypeOf("number")
      expect(authorization.scope).toEqual(scope)
      expect(authorization.tokenType).toEqual("bearer")
      expect(authorization.type).toEqual("guest")

      expect(lastAuthorization.accessToken).toBeTypeOf("string")
      expect(lastAuthorization.createdAt).toBeTypeOf("number")
      expect(lastAuthorization.expires).toBeInstanceOf(Date)
      expect(lastAuthorization.expiresIn).toBeTypeOf("number")
      expect(lastAuthorization.scope).toEqual(scope)
      expect(lastAuthorization.tokenType).toEqual("bearer")
      expect(lastAuthorization.type).toEqual("guest")

      expect(storage.setItem).toHaveBeenCalledTimes(1)
      expect(storage.setItem).toHaveBeenNthCalledWith(
        1,
        `cl_guest-${clientId}-${scope}`,
        {
          accessToken: authorization.accessToken,
          refreshToken: authorization.refreshToken,
          scope: authorization.scope,
        },
      )

      expect(storage.getItem).toHaveBeenCalledTimes(2 + 1 + 1)
      expect(storage.getItem).toHaveBeenNthCalledWith(
        1,
        `cl_customer-${clientId}-${scope}`,
      )
      expect(storage.getItem).toHaveBeenNthCalledWith(
        2,
        `cl_guest-${clientId}-${scope}`,
      )
      expect(storage.getItem).toHaveBeenNthCalledWith(
        3,
        `cl_customer-${clientId}-${scope}`,
      )
      expect(storage.getItem).toHaveBeenNthCalledWith(
        4,
        `cl_customer-${clientId}-${scope}`,
      )

      expect(storage.removeItem).toHaveBeenCalledTimes(0)
    })

    it("should be able to set and revoke a customer token.", async () => {
      const storage = makeMockedStorage()

      const salesChannel = makeSalesChannel(
        {
          clientId,
          scope,
          domain,
        },
        {
          storage,
        },
      )

      const authorizationBefore = await salesChannel.getAuthorization()

      const customerToken = await authenticate("password", {
        clientId,
        scope,
        domain,
        username,
        password,
      })

      await salesChannel.setCustomer(customerToken)

      const authorizationAfter = await salesChannel.getAuthorization()

      expect(authorizationBefore.accessToken).toBeTypeOf("string")
      expect(authorizationBefore.createdAt).toBeTypeOf("number")
      expect(authorizationBefore.expires).toBeInstanceOf(Date)
      expect(authorizationBefore.expiresIn).toBeTypeOf("number")
      expect(authorizationBefore.scope).toEqual(scope)
      expect(authorizationBefore.tokenType).toEqual("bearer")
      expect(authorizationBefore.type).toEqual("guest")

      expect(authorizationAfter.accessToken).toBeTypeOf("string")
      expect(authorizationAfter.createdAt).toBeTypeOf("number")
      expect(authorizationAfter.expires).toBeInstanceOf(Date)
      expect(authorizationAfter.expiresIn).toBeTypeOf("number")
      expect(authorizationAfter.scope).toEqual(scope)
      expect(authorizationAfter.tokenType).toEqual("bearer")
      expect(authorizationAfter.type).toEqual("customer")
      // @ts-expect-error `customerId` is present only when type is `customer`
      expect(authorizationAfter.customerId).toEqual("gOqzZhZrmQ")

      expect(storage.setItem).toHaveBeenCalledTimes(2)
      expect(storage.setItem).toHaveBeenNthCalledWith(
        1,
        `cl_guest-${clientId}-${scope}`,
        {
          accessToken: authorizationBefore.accessToken,
          refreshToken: authorizationBefore.refreshToken,
          scope: authorizationBefore.scope,
        },
      )
      expect(storage.setItem).toHaveBeenNthCalledWith(
        2,
        `cl_customer-${clientId}-${scope}`,
        {
          accessToken: authorizationAfter.accessToken,
          refreshToken: authorizationAfter.refreshToken,
          scope: authorizationAfter.scope,
        },
      )

      // This is called only twice because the last customer token result is taken from the built-in memory cache.
      expect(storage.getItem).toHaveBeenCalledTimes(2)
      expect(storage.getItem).toHaveBeenNthCalledWith(
        1,
        `cl_customer-${clientId}-${scope}`,
      )
      expect(storage.getItem).toHaveBeenNthCalledWith(
        2,
        `cl_guest-${clientId}-${scope}`,
      )

      await salesChannel.logoutCustomer()

      const authorizationAfterLogout = await salesChannel.getAuthorization()

      expect(authorizationAfterLogout.accessToken).toBeTypeOf("string")
      expect(authorizationAfterLogout.createdAt).toBeTypeOf("number")
      expect(authorizationAfterLogout.expires).toBeInstanceOf(Date)
      expect(authorizationAfterLogout.expiresIn).toBeTypeOf("number")
      expect(authorizationAfterLogout.scope).toEqual(scope)
      expect(authorizationAfterLogout.tokenType).toEqual("bearer")
      expect(authorizationAfterLogout.type).toEqual("guest")

      expect(storage.setItem).toHaveBeenCalledTimes(2)
      expect(storage.getItem).toHaveBeenCalledTimes(3) // This is called 3 times instead of 4, because the last guest token result is taken from the built-in memory cache.
      expect(storage.getItem).toHaveBeenNthCalledWith(
        3,
        `cl_customer-${clientId}-${scope}`,
      )

      expect(storage.removeItem).toHaveBeenCalledTimes(1)
    })
  })

  describe("makeIntegration", () => {
    it("should have a built-in memory cache that reduces load on the underlying configured storage.", async () => {
      const storage = makeMockedStorage()

      const integration = makeIntegration(
        {
          clientId: integrationClientId,
          clientSecret,
          scope,
          domain,
        },
        {
          storage,
        },
      )

      const authorization = await integration.getAuthorization() // 2 calls - first one is to check customer token and second one is to check guest token

      await integration.getAuthorization() // 1 call - to check customer token (guest token is already in the built-in memory cache)
      const lastAuthorization = await integration.getAuthorization() // 1 call - to check customer token (guest token is already in the built-in memory cache)

      expect(authorization.accessToken).toBeTypeOf("string")
      expect(authorization.createdAt).toBeTypeOf("number")
      expect(authorization.expires).toBeInstanceOf(Date)
      expect(authorization.expiresIn).toBeTypeOf("number")
      expect(authorization.scope).toEqual(scope)
      expect(authorization.tokenType).toEqual("bearer")
      expect(authorization.type).toEqual("guest")

      expect(lastAuthorization.accessToken).toBeTypeOf("string")
      expect(lastAuthorization.createdAt).toBeTypeOf("number")
      expect(lastAuthorization.expires).toBeInstanceOf(Date)
      expect(lastAuthorization.expiresIn).toBeTypeOf("number")
      expect(lastAuthorization.scope).toEqual(scope)
      expect(lastAuthorization.tokenType).toEqual("bearer")
      expect(lastAuthorization.type).toEqual("guest")

      expect(storage.setItem).toHaveBeenCalledTimes(1)
      expect(storage.setItem).toHaveBeenNthCalledWith(
        1,
        `cl_guest-${integrationClientId}-${scope}`,
        {
          accessToken: authorization.accessToken,
          refreshToken: authorization.refreshToken,
          scope: authorization.scope,
        },
      )

      expect(storage.getItem).toHaveBeenCalledTimes(2 + 1 + 1)
      expect(storage.getItem).toHaveBeenNthCalledWith(
        1,
        `cl_customer-${integrationClientId}-${scope}`,
      )
      expect(storage.getItem).toHaveBeenNthCalledWith(
        2,
        `cl_guest-${integrationClientId}-${scope}`,
      )
      expect(storage.getItem).toHaveBeenNthCalledWith(
        3,
        `cl_customer-${integrationClientId}-${scope}`,
      )
      expect(storage.getItem).toHaveBeenNthCalledWith(
        4,
        `cl_customer-${integrationClientId}-${scope}`,
      )

      expect(storage.removeItem).toHaveBeenCalledTimes(0)
    })
  })
})

const makeMockedStorage: () => Storage = () => {
  const state: Record<string, string> = {}

  return {
    setItem: vitest.fn().mockImplementation(async (key, value) => {
      state[key] = value
    }),
    getItem: vitest.fn().mockImplementation(async (key) => {
      return state[key] ?? null
    }),
    removeItem: vitest.fn().mockImplementation(async (key) => {
      delete state[key]
    }),
  }
}
