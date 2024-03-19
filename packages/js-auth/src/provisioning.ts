import type { TOptions, TReturn } from '#types/index.js'
import { doRequest } from '#utils/doRequest.js'

export type TProvisioningOptions = Omit<TOptions<'client_credentials'>, 'scope'>

export type TProvisioningReturn = TReturn<'client_credentials'>

async function authentication({
  domain = 'commercelayer.io',
  headers,
  ...options
}: TProvisioningOptions): Promise<TProvisioningReturn> {
  return await doRequest({
    attributes: {
      grant_type: 'client_credentials',
      ...options
    },
    domain,
    headers
  })
}

export const provisioning = {
  authentication
}
