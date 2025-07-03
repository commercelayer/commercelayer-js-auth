import { debounce } from "./debounce.js"

describe("debounce", () => {
  it("should debounce the function (expect 1 dispatch)", async () => {
    const fn = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("done")
        }, 30)
      })
    })

    const dfn = debounce(fn)
    dfn()
    dfn()
    dfn()
    dfn()
    await new Promise((resolve) => setTimeout(resolve, 10))
    dfn()
    dfn()
    dfn()
    dfn()
    dfn()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("should debounce the function (expect 2 dispatches)", async () => {
    const fn = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("done")
        }, 30)
      })
    })
    const dfn = debounce(fn)
    dfn()
    dfn()
    dfn()
    dfn()
    await new Promise((resolve) => setTimeout(resolve, 31))
    dfn()
    dfn()
    dfn()
    dfn()
    dfn()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
