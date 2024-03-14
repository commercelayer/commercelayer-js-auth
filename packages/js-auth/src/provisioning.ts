import type { TClientCredentials } from '#types/clientCredentials.js'
import { camelCaseToSnake } from '#utils/camelCaseToSnake.js'
import { snakeToCamelCase } from '#utils/snakeToCamelCase.js'
import type { TBaseReturn } from '#types/index.js'

export type TProvisioningOptions = Omit<TClientCredentials, 'slug' | 'scope'>
export type TProvisioningReturn = TBaseReturn
export interface TokenJson {
  expires: Date
  expires_in: number
  [key: string]: string | number | Date
}

async function authentication({
  domain = 'commercelayer.io',
  headers,
  ...options
}: TProvisioningOptions): Promise<TProvisioningReturn> {
  const attributes = {
    grant_type: 'client_credentials',
    scope: 'provisioning-api',
    ...options
  }

  const body = Object.keys(attributes).reduce((acc: any, key) => {
    const camelKey = camelCaseToSnake(key)
    acc[camelKey] = attributes[key as keyof typeof attributes]
    return acc
  }, {})

  return await fetch(`https://auth.${domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      ...headers
    },
    body: JSON.stringify(body)
  }).then(async (response) => {
    const json: TokenJson = await response.json()
    json.expires = new Date(Date.now() + json.expires_in * 1000)
    return Object.keys(json).reduce((acc: any, key) => {
      const camelKey = snakeToCamelCase(key)
      acc[camelKey] = json[key]
      return acc
    }, {}) as TProvisioningReturn
  })
}

export const provisioning = {
  authentication
}
