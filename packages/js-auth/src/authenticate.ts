import type {
  GrantType,
  AuthenticateOptions,
  AuthenticateReturn
} from './types/index.js'

import { camelCaseToSnakeCase } from './utils/camelCaseToSnakeCase.js'
import { mapKeys } from './utils/mapKeys.js'
import { snakeCaseToCamelCase } from './utils/snakeCaseToCamelCase.js'

interface TokenJson {
  expires: Date
  expires_in: number
  [key: string]: string | number | Date
}

export async function authenticate<G extends GrantType>(
  grantType: G,
  { domain = 'commercelayer.io', headers, ...options }: AuthenticateOptions<G>
): Promise<AuthenticateReturn<G>> {
  const body = mapKeys(
    {
      grant_type: grantType,
      ...options
    },
    camelCaseToSnakeCase
  )

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

  return mapKeys(json, snakeCaseToCamelCase) as unknown as AuthenticateReturn<G>
}
