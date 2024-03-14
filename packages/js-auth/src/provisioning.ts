import type { TClientCredentials } from '#types/clientCredentials.js'
import type { TBaseReturn } from '#types/index.js'
import { doRequest } from '#utils/doRequest.js'

export type TProvisioningOptions = Omit<TClientCredentials, 'slug' | 'scope'>
export type TProvisioningReturn = TBaseReturn

async function authentication({
  domain = 'commercelayer.io',
  headers,
  ...options
}: TProvisioningOptions): Promise<TProvisioningReturn> {
  return await doRequest({
    attributes: {
      grant_type: 'client_credentials',
      scope: 'provisioning-api',
      ...options
    },
    endpoint: `https://auth.${domain}/oauth/token`,
    headers
  })
}

export const provisioning = {
  authentication
}
