const { fetch: originalFetch } = globalThis

globalThis.fetch = async (...args) => {
  return await autoRetryOnError429(originalFetch)(...args)
}

const autoRetryOnError429 = (fetch: typeof globalThis.fetch) => {
  return async (
    ...args: Parameters<typeof globalThis.fetch>
  ): Promise<Response> => {
    const response = await fetch(...args)

    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 30_000))
      return autoRetryOnError429(fetch)(...args)
    }

    return response
  }
}
