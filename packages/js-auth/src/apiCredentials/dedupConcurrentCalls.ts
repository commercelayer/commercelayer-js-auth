/**
 * Deduplicates concurrent calls to a function with the same arguments.
 * If multiple calls are made with the same arguments, only the first call
 * will be executed, and all subsequent calls will receive the same result
 * once it resolves. This is useful for preventing duplicate API calls or
 * expensive operations that are called simultaneously with the same parameters.
 */
// biome-ignore lint/suspicious/noExplicitAny: It accepts any function type.
export const dedupConcurrentCalls = <T extends (...args: any[]) => any>(
  fn: T,
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
  type Return = Awaited<ReturnType<T>>
  type Args = Parameters<T>

  const ongoingCalls = new Map<
    string,
    {
      requestQueue: Array<{
        resolve: (value: Return) => void
        reject: Parameters<ConstructorParameters<typeof Promise>[0]>[1]
      }>
    }
  >()

  return function (this: unknown, ...args: Args): Promise<Return> {
    return new Promise((resolve, reject) => {
      const argsKey = JSON.stringify(args)
      const current = ongoingCalls.get(argsKey)

      if (current === undefined) {
        ongoingCalls.set(argsKey, { requestQueue: [] })

        void Promise.resolve(fn.apply(this, args))
          .then((result) => {
            const query = ongoingCalls.get(argsKey)?.requestQueue ?? []
            ongoingCalls.delete(argsKey)

            resolve(result)
            for (const item of query) {
              item.resolve(result)
            }
          })
          .catch((error) => {
            const query = ongoingCalls.get(argsKey)?.requestQueue ?? []
            ongoingCalls.delete(argsKey)

            reject(error)
            for (const item of query) {
              item.reject(error)
            }
          })
      } else {
        current.requestQueue.push({
          resolve,
          reject,
        })
      }
    })
  }
}
