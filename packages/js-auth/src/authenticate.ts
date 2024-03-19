import type { GrantType, TOptions, TReturn } from '#types/index.js'

import { camelCaseToSnake } from './utils/camelCaseToSnake.js'
import { snakeToCamelCase } from './utils/snakeToCamelCase.js'

interface TokenJson {
  expires: Date
  expires_in: number
  [key: string]: string | number | Date
}

async function doRequest<Output>({
  attributes,
  headers,
  domain
}: {
  attributes: Record<string, unknown>
  headers?: HeadersInit
  domain: string
}): Promise<Output> {
  const body = Object.keys(attributes).reduce((acc: any, key) => {
    const camelKey = camelCaseToSnake(key)
    acc[camelKey] = attributes[key]
    return acc
  }, {})

  return await fetch(`https://auth.${domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
    }, {})
  })
}

export async function authenticate<G extends GrantType>(
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
