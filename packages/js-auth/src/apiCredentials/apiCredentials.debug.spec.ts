import createFetchMock from "vitest-fetch-mock"
import {
  createCompositeStorage,
  makeSalesChannel,
  type Storage,
  type StorageValue,
} from "./index.js"

const fetchMocker = createFetchMock(vi)

const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {})

const clientId = "a-client-id"
const scope = "market:all"

beforeEach(() => {
  consoleLog.mockClear()
})

afterEach(() => {
  // changes default behavior of fetchMock to use the real 'fetch' implementation and not mock responses
  fetchMocker.dontMock()
})

afterAll(() => {
  consoleLog.mockRestore()
})

describe("makeSalesChannel — debug logging", () => {
  it("should not log anything when debug is not enabled", async () => {
    const salesChannel = makeSalesChannel(
      { clientId, scope },
      { storage: makeStorageWithValidGuestToken() },
    )

    await salesChannel.getAuthorization()

    expect(consoleLog).not.toHaveBeenCalled()
  })

  it("should not log anything on a cache hit when debug is `'info'`", async () => {
    const salesChannel = makeSalesChannel(
      { clientId, scope, debug: { logLevel: "info" } },
      { storage: makeStorageWithValidGuestToken() },
    )

    await salesChannel.getAuthorization()
    await salesChannel.getAuthorization()

    expect(consoleLog).not.toHaveBeenCalled()
  })

  it("should log the cache hit when debug is `verbose`", async () => {
    const salesChannel = makeSalesChannel(
      { clientId, scope, debug: { logLevel: "verbose" } },
      { storage: makeStorageWithValidGuestToken() },
    )

    await salesChannel.getAuthorization()

    expect(loggedText()).toContain("Checking for customer key:")
    expect(loggedText()).toContain('Found "guest" authorization in storage')
  })

  it("should log the transition when a new guest token is requested (cache miss)", async () => {
    const accessToken = makeToken({
      iat: nowInSeconds(),
      exp: nowInSeconds() + 7200,
    })

    fetchMocker.enableMocks()
    fetchMocker.doMockOnce(() => ({
      body: JSON.stringify({
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 7200,
        scope,
        created_at: nowInSeconds(),
      }),
    }))

    const salesChannel = makeSalesChannel(
      { clientId, scope, debug: { logLevel: "info", maskToken: false } },
      { storage: makeMemoryStorage("memory") },
    )

    await salesChannel.getAuthorization()

    expect(loggedText()).toContain(
      "No valid authorization found, requesting a new guest token",
    )
    expect(loggedText()).toContain('Stored "guest" authorization to storage')

    // steady-state operations are not logged at info level
    expect(loggedText()).not.toContain("Checking for customer key:")
    expect(loggedText()).not.toContain('Found "guest" authorization in storage')

    // the full access token is visible when maskToken is false (e.g. for jwt.io)
    expect(loggedText()).toContain(accessToken)
  })

  it("should log the transition when an expired customer authorization is removed", async () => {
    const storage = makeStorageWithValidGuestToken()
    const expiredCustomerToken = makeToken({
      iat: nowInSeconds() - 200,
      exp: nowInSeconds() - 10,
      owner: { id: "cust_123", type: "Customer" },
    })

    await storage.setItem(`cl_customer-${clientId}-${scope}`, {
      accessToken: expiredCustomerToken,
      scope,
    })

    const salesChannel = makeSalesChannel(
      { clientId, scope, debug: { logLevel: "info" } },
      { storage },
    )

    const authorization = await salesChannel.getAuthorization()

    expect(authorization.ownerType).toEqual("guest")
    expect(loggedText()).toContain("Customer authorization expired")
    expect(loggedText()).toContain("removing stale authorization")
  })

  it("should log the transition when an authorization is removed", async () => {
    const salesChannel = makeSalesChannel(
      { clientId, scope, debug: { logLevel: "info" } },
      { storage: makeStorageWithValidGuestToken() },
    )

    await salesChannel.removeAuthorization("guest")

    expect(loggedText()).toContain('Removed "guest" authorization with key:')
  })
})

describe("createCompositeStorage — debug logging", () => {
  it("should log the transition when a value is found in a fallback storage, and stay silent on faster-storage hits", async () => {
    const fasterStorage = makeMemoryStorage("memory")
    const slowerStorage = makeMemoryStorage("redis")

    const value: StorageValue = { accessToken: "an-access-token", scope }
    await slowerStorage.setItem("a-key", value)

    const compositeStorage = createCompositeStorage({
      storages: [fasterStorage, slowerStorage],
      name: "composite-storage",
      debug: { logLevel: "info" },
    })

    // fallback hit: found in "redis", backfilled to "memory"
    await compositeStorage.getItem("a-key")

    expect(loggedText()).toContain(
      'Value for key "a-key" found in fallback storage "redis" after missing in [memory], backfilling faster storages',
    )

    consoleLog.mockClear()

    // steady-state hit on the faster storage: silent
    await compositeStorage.getItem("a-key")

    expect(consoleLog).not.toHaveBeenCalled()

    // total miss: silent when debug is `'info'`
    await compositeStorage.getItem("another-key")

    expect(consoleLog).not.toHaveBeenCalled()
  })

  it("should log steady-state hits and misses when debug is `verbose`", async () => {
    const storage = makeMemoryStorage("memory")
    await storage.setItem("a-key", { accessToken: "an-access-token", scope })

    const compositeStorage = createCompositeStorage({
      storages: [storage],
      name: "composite-storage",
      debug: { logLevel: "verbose" },
    })

    await compositeStorage.getItem("a-key")
    await compositeStorage.getItem("another-key")

    expect(loggedText()).toContain(
      'Value for key "a-key" found in storage "memory"',
    )
    expect(loggedText()).toContain(
      'Value for key "another-key" not found in any storage',
    )
  })
})

function loggedText(): string {
  return consoleLog.mock.calls
    .map((call) =>
      call
        .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
        .join(" "),
    )
    .join("\n")
}

function makeMemoryStorage(name: string): Storage {
  const state = new Map<string, StorageValue>()

  return {
    name,
    async getItem(key) {
      return state.get(key) ?? null
    },
    async setItem(key, value) {
      state.set(key, value)
    },
    async removeItem(key) {
      state.delete(key)
    },
  }
}

function makeStorageWithValidGuestToken(): Storage {
  const storage = makeMemoryStorage("memory")

  void storage.setItem(`cl_guest-${clientId}-${scope}`, {
    accessToken: makeToken({
      iat: nowInSeconds() - 200,
      exp: nowInSeconds() + 3600,
    }),
    scope,
  })

  return storage
}

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function makeToken(payload: Record<string, unknown>): string {
  const header = { alg: "HS256", typ: "JWT", kid: "test-key" }
  const encodedHeader = Buffer.from(JSON.stringify(header), "binary").toString(
    "base64url",
  )
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf-8").toString(
    "base64url",
  )
  return `${encodedHeader}.${encodedPayload}.signature`
}
