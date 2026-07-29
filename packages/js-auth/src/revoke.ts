import { jwtDecode } from "./jwtDecode.js"
import type { RevokeOptions, RevokeReturn } from "./types/index.js"

import { camelCaseToSnakeCase } from "./utils/camelCaseToSnakeCase.js"
import { extractIssuer } from "./utils/extractIssuer.js"
import { mapKeys } from "./utils/mapKeys.js"

/**
 * Revoke a previously generated access token (refresh tokens included) before its natural expiration date.
 *
 * **This does not clear any cached authorization.** When the token is managed by
 * `makeSalesChannel` or `makeIntegration`, the revoked token stays in the configured
 * storage and the next `getAuthorization()` call reads it back and considers it valid
 * until it expires. Prefer `salesChannel.logoutCustomer()` or
 * `integration.revokeAuthorization()`, which revoke **and** clear the storage.
 *
 * Like `authenticate`, this resolves with an `errors` array instead of throwing.
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
  const issuer = extractIssuer(decodedJWT)

  const response = await fetch(`${issuer}/oauth/revoke`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  return (await response.json()) as RevokeReturn
}
