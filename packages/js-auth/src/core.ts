import type { GrantType, TOptions, TReturn } from '#types/index.js'
import { doRequest } from '#utils/doRequest.js'

async function authentication<G extends GrantType>(
  grantType: G,
  { domain = 'commercelayer.io', slug, headers, ...options }: TOptions<G>
): Promise<TReturn<G>> {
  return await doRequest({
    attributes: {
      grant_type: grantType,
      ...options
    },
    endpoint: `https://${slug}.${domain}/oauth/token`,
    headers
  })
}

export const core = {
  authentication
}
