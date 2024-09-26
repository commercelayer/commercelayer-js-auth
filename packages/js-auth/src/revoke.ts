import { jwtDecode } from './jwtDecode.js'
import type { RevokeOptions, RevokeReturn } from './types/index.js'

import { camelCaseToSnakeCase } from './utils/camelCaseToSnakeCase.js'
import { mapKeys } from './utils/mapKeys.js'

/**
 * Revoke a previously generated access token (refresh tokens included) before its natural expiration date.
 *
 * @param options Revoke options
 * @returns
 * @example
 * ```ts
 * await revoke({
 *   clientId: '{{ integrationClientId }}',
 *   clientSecret: '{{ integrationClientSecret }}',
 *   token: authenticateResponse.accessToken
 * })
 * ```
 */
export async function revoke(options: RevokeOptions): Promise<RevokeReturn> {
  const body = mapKeys(options, camelCaseToSnakeCase)
  const decodedJWT = jwtDecode(options.token)

  console.log(decodedJWT.payload.iss)

  const response = await fetch(`${decodedJWT.payload.iss}/oauth/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  })

  return (await response.json()) as RevokeReturn
}
