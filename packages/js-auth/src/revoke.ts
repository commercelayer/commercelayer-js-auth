import type { RevokeOptions, RevokeReturn } from './types/index.js'

import { camelCaseToSnakeCase } from './utils/camelCaseToSnakeCase.js'
import { mapKeys } from './utils/mapKeys.js'

export async function revoke({
  domain = 'commercelayer.io',
  ...options
}: RevokeOptions): Promise<RevokeReturn> {
  const body = mapKeys(options, camelCaseToSnakeCase)

  const response = await fetch(`https://auth.${domain}/oauth/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  })

  return (await response.json()) as RevokeReturn
}
