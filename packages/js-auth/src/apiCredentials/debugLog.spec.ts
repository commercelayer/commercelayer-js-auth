import { createDebugLog } from "./debugLog.js"

const token = "eyJhbGciOiJSUzUxMiJ9.payload.signature"

describe("createDebugLog", () => {
  const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {})

  beforeEach(() => {
    consoleLog.mockClear()
  })

  afterAll(() => {
    consoleLog.mockRestore()
  })

  it("should not log anything when debug is not defined", () => {
    const log = createDebugLog({ debug: undefined, logPrefix: "sales_channel" })

    log("info", "memory", "an event")
    log("verbose", "memory", "a steady-state operation")

    expect(consoleLog).not.toHaveBeenCalled()
  })

  it("should log info events only when debug is `{ logLevel: 'info' }`", () => {
    const log = createDebugLog({
      debug: { logLevel: "info" },
      logPrefix: "sales_channel",
    })
    const authorization = {
      accessToken: token,
      refreshToken: "refresh-token",
      scope: "market:all",
    }

    log("info", "memory", "an event", authorization)
    log("verbose", "memory", "a steady-state operation")

    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(
      "[CommerceLayer • auth.js] [sales_channel] [memory] an event",
      {
        accessToken: "eyJh...ture",
        refreshToken: "refr...oken",
        scope: "market:all",
      },
    )
  })

  it("should log everything when debug is `{ logLevel: 'verbose' }`", () => {
    const log = createDebugLog({
      debug: { logLevel: "verbose" },
      logPrefix: "integration",
    })

    log("info", "memory", "an event")
    log("verbose", undefined, "a steady-state operation")

    expect(consoleLog).toHaveBeenCalledTimes(2)
    expect(consoleLog).toHaveBeenNthCalledWith(
      1,
      "[CommerceLayer • auth.js] [integration] [memory] an event",
    )
    expect(consoleLog).toHaveBeenNthCalledWith(
      2,
      "[CommerceLayer • auth.js] [integration] a steady-state operation",
    )
  })

  it("should mask tokens by default", () => {
    const log = createDebugLog({
      debug: { logLevel: "info" },
      logPrefix: "sales_channel",
    })
    const authorization = {
      accessToken: token,
      refreshToken: "refresh-token",
      scope: "market:all",
    }

    log("info", "memory", "Stored authorization", authorization)

    expect(consoleLog).toHaveBeenCalledWith(
      "[CommerceLayer • auth.js] [sales_channel] [memory] Stored authorization",
      {
        accessToken: "eyJh...ture",
        refreshToken: "refr...oken",
        scope: "market:all",
      },
    )
  })

  it("should pass tokens through when maskToken is `false`", () => {
    const log = createDebugLog({
      debug: { logLevel: "info", maskToken: false },
      logPrefix: "sales_channel",
    })
    const authorization = { accessToken: token, scope: "market:all" }

    log("info", "memory", "Stored authorization", authorization)

    expect(consoleLog).toHaveBeenCalledWith(
      "[CommerceLayer • auth.js] [sales_channel] [memory] Stored authorization",
      authorization,
    )
  })

  it("should pass through values that are too short to be a JWT", () => {
    const log = createDebugLog({
      debug: { logLevel: "info" },
      logPrefix: "sales_channel",
    })

    log("info", "memory", "Stored authorization", {
      accessToken: "short",
      scope: "market:all",
    })

    expect(consoleLog).toHaveBeenCalledWith(
      "[CommerceLayer • auth.js] [sales_channel] [memory] Stored authorization",
      { accessToken: "short", scope: "market:all" },
    )
  })

  it("should not mutate the original object when redacting", () => {
    const log = createDebugLog({
      debug: { logLevel: "info" },
      logPrefix: "sales_channel",
    })
    const authorization = { accessToken: token, scope: "market:all" }

    log("info", "memory", "Stored authorization", authorization)

    expect(authorization.accessToken).toBe(token)
  })

  it("should leave non-authorization arguments unchanged when redacting", () => {
    const log = createDebugLog({
      debug: { logLevel: "info" },
      logPrefix: "sales_channel",
    })

    log("info", "memory", "Cache miss", "some-key")

    expect(consoleLog).toHaveBeenCalledWith(
      "[CommerceLayer • auth.js] [sales_channel] [memory] Cache miss",
      "some-key",
    )
  })
})
