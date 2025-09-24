type GenericMethod = (
  // biome-ignore lint/suspicious/noExplicitAny: I don't wanna specify args
  ...args: any[]
) => Promise<{ errors?: { status: number }[] }>

export const autoRetryOnError429 = <Method extends GenericMethod>(
  method: Method,
): Method => {
  const handler: GenericMethod = async (...args) => {
    const response = await method(...args)

    if (
      response.errors != null &&
      response.errors.find((e) => e.status === 429) != null
    ) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(handler(...args))
        }, 30_000)
      })
    }

    return response
  }

  return handler as Method
}
