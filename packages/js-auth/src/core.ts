import type { GrantType, TOptions, TReturn } from '#types/index.js'
import { doRequest } from '#utils/doRequest.js'

async function authentication<G extends GrantType>(
  grantType: G,
  { domain = 'commercelayer.io', headers, ...options }: TOptions<G>
): Promise<TReturn<G>> {
  return await doRequest({
    attributes: {
      grant_type: grantType,
      ...options
    },
    domain,
    headers
  })
}

export const core = {
  authentication
}
