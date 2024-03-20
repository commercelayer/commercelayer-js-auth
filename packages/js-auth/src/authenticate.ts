import type { GrantType, TOptions, TReturn } from '#types/index.js'

import { camelCaseToSnakeCase } from '#utils/camelCaseToSnakeCase.js'
import { mapKeys } from '#utils/mapKeys.js'
import { snakeCaseToCamelCase } from '#utils/snakeCaseToCamelCase.js'

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
  const body = mapKeys(attributes, camelCaseToSnakeCase)

  const response = await fetch(`https://auth.${domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  })

  const json: TokenJson = await response.json()
  json.expires = new Date(Date.now() + json.expires_in * 1000)

  return mapKeys(json, snakeCaseToCamelCase) as Output
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