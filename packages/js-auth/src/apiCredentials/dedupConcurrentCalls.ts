/**
 * Deduplicates concurrent calls to a function with the same arguments.
 * If multiple calls are made with the same arguments, only the first call
 * will be executed, and all subsequent calls will receive the same result
 * once it resolves. This is useful for preventing duplicate API calls or
 * expensive operations that are called simultaneously with the same parameters.
 */
// biome-ignore lint/suspicious/noExplicitAny:
export const dedupConcurrentCalls = <T extends (...args: any[]) => any>(
  fn: T,
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
  type Return = Awaited<ReturnType<T>>
  type Args = Parameters<T>

  const ongoingCalls = new Map<
    string,
    {
      response: Promise<Return>
      resolveList: Array<((value: Return) => void) | null>
    }
  >()

  type OngoingCalls = Exclude<ReturnType<typeof ongoingCalls.get>, undefined>

  return function (this: unknown, ...args: Args): Promise<Return> {
    return new Promise((resolve, reject) => {
      const argsKey = JSON.stringify(args)
      const current = ongoingCalls.get(argsKey)

      if (current !== undefined) {
        current.resolveList.push(resolve)
      } else {
        const resolveList: OngoingCalls["resolveList"] = [null]
        const response: OngoingCalls["response"] = Promise.resolve(
          fn.apply(this, args),
        )

        ongoingCalls.set(argsKey, { response, resolveList })

        response
          .then((result) => {
            const entry = ongoingCalls.get(argsKey)
            if (entry !== undefined) {
              for (const resolver of entry.resolveList) {
                if (resolver !== null) {
                  resolver(result)
                }
              }
              ongoingCalls.delete(argsKey)
            }
          })
          .catch((error) => {
            const entry = ongoingCalls.get(argsKey)
            if (entry !== undefined) {
              const currentResolvers = entry.resolveList
              ongoingCalls.delete(argsKey)
              for (const resolver of currentResolvers) {
                if (resolver !== null) {
                  reject(error)
                }
              }
            }
          })
          .finally(() => {
            const entry = ongoingCalls.get(argsKey)
            if (entry !== undefined) {
              ongoingCalls.delete(argsKey)
            }
          })

        resolve(response)
      }
    })
  }
}
