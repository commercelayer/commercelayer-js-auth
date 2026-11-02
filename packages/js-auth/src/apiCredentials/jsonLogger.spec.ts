import type { DebugLogEntry } from "./debugLog.js"
import { jsonLogger } from "./jsonLogger.js"

const entry: DebugLogEntry = {
  level: "info",
  source: "sales_channel",
  storageName: "memory",
  message: "Stored authorization",
  data: [],
}

describe("jsonLogger", () => {
  const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {})

  beforeEach(() => {
    consoleLog.mockClear()
  })

  afterAll(() => {
    consoleLog.mockRestore()
  })

  /** Returns the JSON line written by the last `jsonLogger` call, parsed. */
  function lastLine() {
    const line = consoleLog.mock.calls.at(-1)?.[0] as string
    expect(line).not.toContain("\n")
    return JSON.parse(line)
  }

  it("should log the entry as a single line of JSON", () => {
    jsonLogger({
      ...entry,
      data: [{ accessToken: "eyJh...ture", scope: "market:all" }],
    })

    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog.mock.calls[0]).toHaveLength(1)
    expect(lastLine()).toEqual({
      name: "@commercelayer/js-auth",
      level: "info",
      source: "sales_channel",
      storageName: "memory",
      message: "Stored authorization",
      data: [{ accessToken: "eyJh...ture", scope: "market:all" }],
    })
  })

  it("should omit `storageName` and `data` when there are none", () => {
    jsonLogger({
      level: "verbose",
      source: "storage",
      message: "a steady-state operation",
      data: [],
    })

    expect(lastLine()).toEqual({
      name: "@commercelayer/js-auth",
      level: "verbose",
      source: "storage",
      message: "a steady-state operation",
    })
  })

  it("should serialize errors instead of dropping them", () => {
    jsonLogger({ ...entry, data: [new TypeError("something went wrong")] })

    const { data } = lastLine()
    expect(data[0]).toMatchObject({
      name: "TypeError",
      message: "something went wrong",
    })
    expect(data[0].stack).toEqual(expect.any(String))
  })

  it("should keep an error's cause and custom properties", () => {
    const error = Object.assign(
      new Error("request failed", { cause: new Error("socket hang up") }),
      { status: 503 },
    )

    jsonLogger({ ...entry, data: [error] })

    expect(lastLine().data[0]).toMatchObject({
      name: "Error",
      message: "request failed",
      status: 503,
      cause: { name: "Error", message: "socket hang up" },
    })
  })

  it("should replace circular references", () => {
    const circular: { scope: string; self?: unknown } = { scope: "market:all" }
    circular.self = circular

    jsonLogger({ ...entry, data: [circular] })

    expect(lastLine().data).toEqual([
      { scope: "market:all", self: "[Circular]" },
    ])
  })

  it("should not mark an object shared by two branches as circular", () => {
    const market = { id: "market:1" }

    jsonLogger({ ...entry, data: [{ market, also: market }] })

    expect(lastLine().data).toEqual([
      { market: { id: "market:1" }, also: { id: "market:1" } },
    ])
  })

  it("should serialize bigint values as strings", () => {
    jsonLogger({ ...entry, data: [{ total: 10n }] })

    expect(lastLine().data).toEqual([{ total: "10" }])
  })
})
