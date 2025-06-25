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
  it("with 'makeSalesChannel'.", async () => {
    const storage = makeNoStorage()

    const auth = makeSalesChannel(
      {
        clientId,
        scope,
        domain,
      },
      {
        storage,
      },
    )

    const authorization = await auth.getAuthorization()

    expect(authorization.accessToken).toBeTypeOf("string")
    expect(authorization.createdAt).toBeTypeOf("number")
    expect(authorization.expires).toBeInstanceOf(Date)
    expect(authorization.expiresIn).toBeTypeOf("number")
    expect(authorization.scope).toEqual(scope)
    expect(authorization.tokenType).toEqual("bearer")
    expect(authorization.type).toEqual("guest")

    expect(storage.setItem).toHaveBeenCalledTimes(1)
    expect(storage.setItem).toHaveBeenNthCalledWith(
      1,
      `cl_guest-${clientId}-${scope}`,
      JSON.stringify(authorization),
    )

    expect(storage.getItem).toHaveBeenCalledTimes(2)
    expect(storage.getItem).toHaveBeenNthCalledWith(
      1,
      `cl_customer-${clientId}-${scope}`,
    )
    expect(storage.getItem).toHaveBeenNthCalledWith(
      2,
      `cl_guest-${clientId}-${scope}`,
    )

    expect(storage.removeItem).toHaveBeenCalledTimes(0)
  })

  it("with 'password'.", async () => {
    const storage = makeInMemoryStorage()

    const auth = makeSalesChannel(
      {
        clientId,
        scope,
        domain,
      },
      {
        storage,
      },
    )

    const authorizationBefore = await auth.getAuthorization()

    const customerToken = await authenticate("password", {
      clientId,
      scope,
      domain,
      username,
      password,
    })

    await auth.setCustomer(customerToken)

    const authorizationAfter = await auth.getAuthorization()

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
      JSON.stringify(authorizationBefore),
    )
    expect(storage.setItem).toHaveBeenNthCalledWith(
      2,
      `cl_customer-${clientId}-${scope}`,
      JSON.stringify(authorizationAfter),
    )

    expect(storage.getItem).toHaveBeenCalledTimes(3)
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

    expect(storage.removeItem).toHaveBeenCalledTimes(0)
  })

  it("with 'integration'.", async () => {
    const storage = makeNoStorage()

    const auth = makeIntegration(
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

    const authorization = await auth.getAuthorization()

    expect(authorization.accessToken).toBeTypeOf("string")
    expect(authorization.createdAt).toBeTypeOf("number")
    expect(authorization.expires).toBeInstanceOf(Date)
    expect(authorization.expiresIn).toBeTypeOf("number")
    expect(authorization.scope).toEqual(scope)
    expect(authorization.tokenType).toEqual("bearer")
    expect(authorization.type).toEqual("guest")

    expect(storage.setItem).toHaveBeenCalledTimes(1)
    expect(storage.setItem).toHaveBeenNthCalledWith(
      1,
      `cl_guest-${integrationClientId}-${scope}`,
      JSON.stringify(authorization),
    )

    expect(storage.getItem).toHaveBeenCalledTimes(2)
    expect(storage.getItem).toHaveBeenNthCalledWith(
      1,
      `cl_customer-${integrationClientId}-${scope}`,
    )
    expect(storage.getItem).toHaveBeenNthCalledWith(
      2,
      `cl_guest-${integrationClientId}-${scope}`,
    )

    expect(storage.removeItem).toHaveBeenCalledTimes(0)
  })
})

describe("makeAuth with custom storage", () => {
  it("no storage provided.", async () => {
    const storage = makeNoStorage()

    const auth = makeSalesChannel(
      {
        clientId,
        scope,
        domain,
      },
      {
        storage,
      },
    )

    const authorization1 = await auth.getAuthorization()
    const authorization2 = await auth.getAuthorization()

    expect(authorization1.accessToken).toBeTypeOf("string")
    expect(authorization1.createdAt).toBeTypeOf("number")
    expect(authorization1.expires).toBeInstanceOf(Date)
    expect(authorization1.expiresIn).toBeTypeOf("number")
    expect(authorization1.scope).toEqual(scope)
    expect(authorization1.tokenType).toEqual("bearer")
    expect(authorization1.type).toEqual("guest")

    expect(authorization2.accessToken).toBeTypeOf("string")
    expect(authorization2.createdAt).toBeTypeOf("number")
    expect(authorization2.expires).toBeInstanceOf(Date)
    expect(authorization2.expiresIn).toBeTypeOf("number")
    expect(authorization2.scope).toEqual(scope)
    expect(authorization2.tokenType).toEqual("bearer")
    expect(authorization2.type).toEqual("guest")

    expect(storage.setItem).toHaveBeenCalledTimes(2)
    expect(storage.setItem).toHaveBeenNthCalledWith(
      1,
      `cl_guest-${clientId}-${scope}`,
      JSON.stringify(authorization1),
    )
    expect(storage.setItem).toHaveBeenNthCalledWith(
      2,
      `cl_guest-${clientId}-${scope}`,
      JSON.stringify(authorization2),
    )

    expect(storage.getItem).toHaveBeenCalledTimes(4)
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
      `cl_guest-${clientId}-${scope}`,
    )

    expect(storage.removeItem).toHaveBeenCalledTimes(0)
  })

  it("in-memory'.", async () => {
    const storage = makeInMemoryStorage()

    const auth = makeSalesChannel(
      {
        clientId,
        scope,
        domain,
      },
      {
        storage,
      },
    )

    const authorization1 = await auth.getAuthorization()
    const authorization2 = await auth.getAuthorization()

    expect(authorization1.accessToken).toBeTypeOf("string")
    expect(authorization1.createdAt).toBeTypeOf("number")
    expect(authorization1.expires).toBeInstanceOf(Date)
    expect(authorization1.expiresIn).toBeTypeOf("number")
    expect(authorization1.scope).toEqual(scope)
    expect(authorization1.tokenType).toEqual("bearer")
    expect(authorization1.type).toEqual("guest")

    expect(authorization2.accessToken).toBeTypeOf("string")
    expect(authorization2.createdAt).toBeTypeOf("number")
    expect(authorization2.expires).toBeInstanceOf(Date)
    expect(authorization2.expiresIn).toBeTypeOf("number")
    expect(authorization2.scope).toEqual(scope)
    expect(authorization2.tokenType).toEqual("bearer")
    expect(authorization2.type).toEqual("guest")

    expect(storage.setItem).toHaveBeenCalledTimes(1)
    expect(storage.setItem).toHaveBeenNthCalledWith(
      1,
      `cl_guest-${clientId}-${scope}`,
      JSON.stringify(authorization1),
    )

    expect(storage.getItem).toHaveBeenCalledTimes(4)
    expect(storage.getItem).toHaveBeenNthCalledWith(
      1,
      `cl_customer-${clientId}-${scope}`,
    )
    expect(storage.getItem).toHaveNthResolvedWith(1, null)
    expect(storage.getItem).toHaveBeenNthCalledWith(
      2,
      `cl_guest-${clientId}-${scope}`,
    )
    expect(storage.getItem).toHaveNthResolvedWith(2, null)
    expect(storage.getItem).toHaveBeenNthCalledWith(
      3,
      `cl_customer-${clientId}-${scope}`,
    )
    expect(storage.getItem).toHaveNthResolvedWith(3, null)
    expect(storage.getItem).toHaveBeenNthCalledWith(
      4,
      `cl_guest-${clientId}-${scope}`,
    )
    expect(storage.getItem).toHaveNthResolvedWith(
      4,
      JSON.stringify(authorization1),
    )

    expect(storage.removeItem).toHaveBeenCalledTimes(0)
  })
})

const makeNoStorage: () => Storage = () => {
  return {
    setItem: vitest.fn(),
    getItem: vitest.fn(),
    removeItem: vitest.fn(),
  }
}
const makeInMemoryStorage: () => Storage = () => {
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
