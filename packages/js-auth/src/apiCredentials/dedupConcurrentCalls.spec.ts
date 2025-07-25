import { dedupConcurrentCalls } from "./dedupConcurrentCalls.js"

describe("dedupConcurrentCalls", () => {
  it("should deduplicates concurrent calls to the function (expect 1 dispatch)", async () => {
    const fn = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("done")
        }, 30)
      })
    })

    const dfn = dedupConcurrentCalls(fn)
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

  it("should deduplicates concurrent calls to the function (expect 2 dispatches)", async () => {
    const fn = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("done")
        }, 30)
      })
    })

    const dfn = dedupConcurrentCalls(fn)
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

  it("should deduplicates concurrent calls to the function given different arguments (expect 4 dispatches)", async () => {
    const fn = vi.fn((num: number, letter: string) => {
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`done with 'num: ${num}' and 'letter: ${letter}'.`)
        }, 30)
      })
    })

    const dfn = dedupConcurrentCalls(fn)
    const resList = []

    resList.push(dfn(3, "A"))
    resList.push(dfn(3, "B"))
    resList.push(dfn(3, "A"))
    resList.push(dfn(3, "B"))
    resList.push(dfn(3, "B"))
    resList.push(dfn(9, "B"))

    await new Promise((resolve) => setTimeout(resolve, 35))

    resList.push(dfn(3, "A"))
    resList.push(dfn(3, "A"))
    resList.push(dfn(3, "C"))
    resList.push(dfn(3, "A"))
    resList.push(dfn(3, "A"))
    resList.push(dfn(3, "C"))
    resList.push(dfn(3, "C"))
    resList.push(dfn(3, "C"))

    expect(fn).toHaveBeenCalledTimes(5)
    expect(fn).toHaveBeenNthCalledWith(1, 3, "A")
    expect(fn).toHaveBeenNthCalledWith(2, 3, "B")
    expect(fn).toHaveBeenNthCalledWith(3, 9, "B")
    expect(fn).toHaveBeenNthCalledWith(4, 3, "A")
    expect(fn).toHaveBeenNthCalledWith(5, 3, "C")

    await expect(Promise.all(resList)).resolves.toEqual([
      "done with 'num: 3' and 'letter: A'.",
      "done with 'num: 3' and 'letter: B'.",
      "done with 'num: 3' and 'letter: A'.",
      "done with 'num: 3' and 'letter: B'.",
      "done with 'num: 3' and 'letter: B'.",
      "done with 'num: 9' and 'letter: B'.",
      "done with 'num: 3' and 'letter: A'.",
      "done with 'num: 3' and 'letter: A'.",
      "done with 'num: 3' and 'letter: C'.",
      "done with 'num: 3' and 'letter: A'.",
      "done with 'num: 3' and 'letter: A'.",
      "done with 'num: 3' and 'letter: C'.",
      "done with 'num: 3' and 'letter: C'.",
      "done with 'num: 3' and 'letter: C'.",
    ])
  })
})
