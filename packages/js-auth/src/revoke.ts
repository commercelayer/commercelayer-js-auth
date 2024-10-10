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
  const iss = decodedJWT?.payload?.iss?.startsWith('https://auth')
    ? decodedJWT.payload.iss
    : 'https://auth.commercelayer.io'

  const response = await fetch(`${iss}/oauth/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  })

  return (await response.json()) as RevokeReturn
}
