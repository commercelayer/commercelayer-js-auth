/**
 * Creates a debounced version of a function.
 * This function will return a Promise that resolves with the result of the original function.
 * If the debounced function is called multiple times, only the first call will be executed immediately,
 * and subsequent calls will be queued until the first call resolves.
 */
// biome-ignore lint/suspicious/noExplicitAny:
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
  type TReturn = Awaited<ReturnType<T>>
  type TArgs = Parameters<T>

  let leadingValue: Promise<TReturn>
  let resolveList: Array<((value: TReturn) => void) | null> = []

  return function (this: unknown, ...arguments_: TArgs): Promise<TReturn> {
    return new Promise((resolve) => {
      const shouldCallNow = resolveList.length === 0

      if (shouldCallNow) {
        resolveList.push(null)
        leadingValue = Promise.resolve(fn.apply(this, arguments_))

        leadingValue.then((result) => {
          for (const resolver of resolveList) {
            resolver?.(result)
          }

          resolveList = []
        })

        resolve(leadingValue)
      } else {
        resolveList.push(resolve)
      }
    })
  }
}
